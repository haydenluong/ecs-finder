const SITE_URL = 'https://timkiemhdnk.com';

// Bilingual bodies: the submitter's language is not stored, and a decision email is sent hours later from a different request, so there is nothing to pick from.
export interface SubmissionEmail {
    subject: string;
    text: string;
}

export function pendingEmail(activityName: string): SubmissionEmail {
    return {
        subject: `Đã nhận hoạt động "${activityName}" | Submission received`,
        text: `Chào bạn,

ECs Finder đã nhận được hoạt động "${activityName}" bạn gửi lên website.

Hoạt động hiện đang chờ duyệt. Tụi mình sẽ xem trong vài ngày tới và báo lại cho bạn ngay khi có kết quả. Bạn không cần gửi lại.

Có thắc mắc gì, bạn cứ trả lời thẳng email này nhé.

---

Hi,

We've received your submission "${activityName}" on Tìm Kiếm HDNK.

It's now waiting for review. We'll look at it over the next few days and email you as soon as there's a decision — no need to submit it again.

If you have any questions, just reply to this email.

${SITE_URL}`,
    };
}

export function approvedEmail(activityName: string): SubmissionEmail {
    return {
        subject: `Hoạt động "${activityName}" đã được duyệt | Submission approved`,
        text: `Chào bạn,

Hoạt động "${activityName}" của bạn đã được duyệt và hiện đang hiển thị trên Tìm Kiếm HDNK.

Bạn xem tại: ${SITE_URL}

Nếu cần sửa hay gỡ thông tin, bạn trả lời email này là được.

---

Hi,

Your submission "${activityName}" has been approved and is now live on Tìm Kiếm HDNK.

You can see it here: ${SITE_URL}

If anything needs correcting or you'd like it taken down, just reply to this email.`,
    };
}

export function rejectedEmail(activityName: string): SubmissionEmail {
    return {
        subject: `Hoạt động "${activityName}" chưa được duyệt | Submission not approved`,
        text: `Chào bạn,

Cảm ơn bạn đã gửi hoạt động "${activityName}" lên Tìm Kiếm HDNK. Lần này tụi mình chưa đăng được hoạt động này.

Thường là do thông tin chưa đủ rõ, link đăng ký không còn hoạt động, hoặc hoạt động không phù hợp với các mục trên trang. Nếu bạn nghĩ có nhầm lẫn, hoặc muốn biết lý do cụ thể, bạn cứ trả lời email này — tụi mình sẽ phản hồi.

Bạn cũng có thể chỉnh lại thông tin và gửi lại bất cứ lúc nào tại ${SITE_URL}/submit

---

Hi,

Thanks for submitting "${activityName}" to Tìm Kiếm HDNK. We weren't able to publish this one.

That's usually because something was unclear, the registration link no longer works, or the activity doesn't fit the categories on the site. If you think that's a mistake, or you'd like to know the specific reason, reply to this email and we'll get back to you.

You're welcome to fix anything and submit again at ${SITE_URL}/submit`,
    };
}
