import nodemailer from "nodemailer";


async function sendMail(recipentEmail,subject,body) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user:"hostelmanagementsystem.noreply@gmail.com", 
            pass: "pmmm ffuh znct zapo"
        }
    });

    let mailOptions = {
        from: {
            name: "Hostel Management System",
            address:"hostelmanagementsystem.noreply@gmail.com"},
        to: recipentEmail, 
        subject: subject,
        html: body
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.log("Error: " + error);
    }
}

export default sendMail;






// const body=`
// Dear Parent/Guardian,
// I hope this email finds you well. This is an automated email generated to request your permission for [Ward's Name] to take leave as per the details mentioned below:

// Student Information:

// Name: [Ward's Name]

// Batch: [Batch Details]

// Leave Duration: From [Start Date] at [Start Time] to [End Date] at [End Time]

// Reason for Leave: [Brief Reason]

// To proceed with the leave request, please confirm your approval by sharing the following OTP only with your ward if you allow this leave: [Generated OTP].

// If you do not approve this request, kindly disregard this email. Should you have any concerns or require further information, feel free to reach out.

// We appreciate your cooperation.

// `

// sendMail("Aryan.Sharma@iiitb.ac.in","Request for approval for the leave of your ward",body);
