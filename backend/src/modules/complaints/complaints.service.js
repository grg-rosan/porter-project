
export const createComplaint = async (userID, role, { orderID, type, description }) => {
  // verify the order involves this user
  const order = await prisma.order.findUnique({
    where: { ID: orderID },
    include: {
      customerProfile: { select: { userID: true } },
      riderProfile:    { select: { userID: true } },
    },
  });
  if (!order) throw new AppError("Order not found", 404);

  // check this user is actually part of the order
  const isCustomer = order.customerProfile.userID === userID;
  const isRider    = order.riderProfile?.userID === userID;
  if (!isCustomer && !isRider)
    throw new AppError("Not authorized to complain about this order", 403);

  // only on completed or cancelled orders
  if (!["DELIVERED", "CANCELLED"].includes(order.order_status))
    throw new AppError("You can only file a complaint after the order is completed or cancelled", 400);

  // prevent duplicate complaints from same user on same order
  const existing = await prisma.complaint.findFirst({
    where: { orderID, filedByUserID: userID },
  });
  if (existing) throw new AppError("You already filed a complaint for this order", 409);

  // the complaint is against the other party
  const againstUserID = isCustomer
    ? order.riderProfile?.userID ?? null   // customer complains against rider
    : order.customerProfile.userID;        // rider complains against customer

  return await prisma.complaint.create({
    data: {
      filedByUserID: userID,
      filedByRole:   role,         // "CUSTOMER" or "RIDER"
      orderID,
      againstUserID,
      type,
      description,
    },
  });
};

export const getMyComplaints = async (userID) => {
  return await prisma.complaint.findMany({
    where: { filedByUserID: userID },
    orderBy: { createdAt: "desc" },
    include: {
      order:   { select: { ID: true, pickup_address: true, drop_address: true } },
      against: { select: { name: true, email: true } },
    },
  });
};

export const getComplaintsService = async ({ status, page = 1, limit = 10 }) => {
  const where = status ? { status } : {};
  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip:     (page - 1) * limit,
      take:     limit,
      orderBy:  { createdAt: "desc" },
      include: {
        filedBy: { select: { name: true, email: true, role: true } },
        against: { select: { name: true, email: true, role: true } },
        order:   { select: { ID: true, order_status: true } },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return { complaints, total, page, totalPages: Math.ceil(total / limit) };
};

export const resolveComplaintService = async (id, { status, adminNote }) => {
  const complaint = await prisma.complaint.findUnique({ where: { ID: id } });
  if (!complaint) throw new AppError("Complaint not found", 404);
  if (["RESOLVED", "DISMISSED"].includes(complaint.status))
    throw new AppError("Complaint is already closed", 400);

  return await prisma.complaint.update({
    where: { ID: id },
    data:  { status, adminNote },
  });
};