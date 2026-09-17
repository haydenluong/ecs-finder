const SITE_URL = 'https://timkiemhdnk.com';

// Bilingual bodies: the submitter's language is not stored, and a decision email is sent hours later from a different request, so there is nothing to pick from.
export interface SubmissionEmail {
    subject: string;
    text: string;
}

export function pendingEmail(activityName: string): SubmissionEmail {
    return {
        subject: `Xác nhận về "${activityName}" tại ECs Finder | Submission received for ECs Finder`,
        text: `Chào bạn,

ECs Finder vừa nhận được ${activityName} bạn gửi qua. Thông tin về hoạt động sẽ được duyệt qua, và ECs Finder sẽ gửi email báo kết quả cho bạn trong một vài giờ.

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

Chào bạn,

${activityName} đã được duyệt và hiện đang có mặt trên ECs Finder: ${SITE_URL}

Nếu bạn cần chỉnh sửa thông tin hoặc muốn gỡ hoạt động xuống, hãy liên hệ với ECs Finder để được hỗ trợ.

Cảm ơn bạn,
ECs Finder

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

${activityName} đã không vượt qua kiểm duyệt để được đăng lên ECs Finder. 

Nếu bạn muốn biết lý do cụ thể hoặc cho rằng đây là một sự nhầm lẫn, hãy liên hệ với ECs Finder để được giải đáp. Bạn cũng có thể chỉnh sửa thông tin và gửi lại tại ${SITE_URL}/submit.

Cảm ơn bạn,
ECs Finder
---

Hi,

Thanks for submitting "${activityName}" to Tìm Kiếm HDNK. We weren't able to publish this one.

That's usually because something was unclear, the registration link no longer works, or the activity doesn't fit the categories on the site. If you think that's a mistake, or you'd like to know the specific reason, reply to this email and we'll get back to you.

You're welcome to fix anything and submit again at ${SITE_URL}/submit`,
    };
}
