import transporter from "../config/mailer.js";
import Communication from "../models/Communication.js";
import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function sendEmail({
  leadId,

  customerId,

  subject,

  message,

  user,
}) {
  //--------------------------------
  // Find Recipient
  //--------------------------------

  let record;

  let linkedType;

  if (leadId) {
    record = await Lead.findById(leadId);

    linkedType = "Lead";
  }

  if (customerId) {
    record = await Customer.findById(customerId);

    linkedType = "Customer";
  }

  if (!record) {
    throw new Error("Lead/Customer not found");
  }

  //--------------------------------
  // Send Email
  //--------------------------------

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,

    to: record.email,

    subject,

    html: message,
  });

  //--------------------------------
  // Save Communication
  //--------------------------------

  const communication = await Communication.create({
    type: "Email",

    subject,

    linkedTo: linkedType,

    lead: leadId || null,

    customer: customerId || null,

    owner: record.owner,

    date: new Date(),

    outcome: "Email Sent",

    sentiment: "Positive",

    from: process.env.SMTP_USER,

    to: record.email,

    body: message,

    status: "Sent",

    messageId: info.messageId,

    createdBy: user.sub,

    updatedBy: user.sub,
  });
  const loggedInUser = await User.findById(user.sub);

  if(!loggedInUser) {
    throw new Error("Logged in user not found");
  }

  //--------------------------------
  // Activity
  //--------------------------------

  console.log("==USER==");
  console.log(user);
  console.log("========");
  await Activity.create({
    label: "Email Sent",

    detail: `${subject} sent to ${record.name}`,


    actor: loggedInUser.name,

    tone: "success",

    relatedType: linkedType,

    relatedId: record._id,

    createdBy: user.sub,

    updatedBy: user.sub,
  });

  //--------------------------------
  // Notification
  //--------------------------------

  if (record.ownerId) {
    await Notification.create({
      title: "Email Sent",

      message: `${subject} sent to ${record.name}`,

      user: record.ownerId,

      type: "System",

      createdBy: user.sub,

      updatedBy: user.sub,
    });
  }

  return communication;
}
export async function addInternalNote({
  leadId,

  customerId,

  note,

  user,
})
 {
  let linkedType = "Lead";

  if (customerId) {
    linkedType = "Customer";
  }

  return await Communication.create({
    type: "Ticket",

    linkedTo: linkedType,

    lead: leadId,

    customer: customerId,

    subject: "Internal Note",

    body: note,

    owner: user.name,

    date: new Date(),

    outcome: "Internal Note",

    sentiment: "Neutral",

    isInternal: true,

    createdBy: user.sub,

    updatedBy: user.sub,
  });
}

export async function getLeadHistory(leadId) {
  return await Communication.find({
    lead: leadId,
  })

    .sort({
      createdAt: -1,
    });
}
export async function getCustomerHistory(customerId) {
  return await Communication.find({
    customer: customerId,
  })

    .sort({
      createdAt: -1,
    });
}
