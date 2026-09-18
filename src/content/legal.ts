export interface Bilingual {
    vi: string;
    en: string;
}

export interface LegalSection {
    heading: Bilingual;
    body?: Bilingual[];
    bullets?: Bilingual[];
}

export interface LegalDoc {
    title: Bilingual;
    intro: Bilingual;
    updated: string;
    sections: LegalSection[];
}

export const CONTACT_EMAIL = 'timkiemhoatdongngoaikhoa@gmail.com';

export const termsDoc: LegalDoc = {
    updated: '18.09.2026',
    title: {
        vi: 'Điều khoản sử dụng',
        en: 'Terms of Use',
    },
    intro: {
        vi: 'ECS Finder là nơi tổng hợp thông tin về hoạt động ngoại khoá do cộng đồng gửi lên. Khi sử dụng website hoặc gửi một hoạt động, bạn đồng ý với các điều khoản dưới đây.',
        en: 'ECS Finder is a directory of extracurricular activities submitted by the community. By using the site or submitting an activity, you agree to the terms below.',
    },
    sections: [
        {
            heading: {
                vi: 'ECS Finder là gì và không phải là gì',
                en: 'What ECS Finder is, and is not',
            },
            body: [
                {
                    vi: 'Chúng tôi tổng hợp và hiển thị thông tin về các hoạt động ngoại khoá do người dùng gửi lên. Chúng tôi không phải là đơn vị tổ chức, không đồng tổ chức, không tài trợ và không đại diện cho bất kỳ hoạt động nào được đăng tải.',
                    en: 'We collect and display information about extracurricular activities submitted by users. We do not organise, co-organise, sponsor or represent any activity listed here.',
                },
                {
                    vi: 'Mọi thoả thuận về việc tham gia, tuyển chọn, học phí hay quyền lợi đều diễn ra trực tiếp giữa bạn và đơn vị tổ chức hoạt động đó.',
                    en: 'Any arrangement about taking part, being selected, fees or benefits is strictly between you and the organisation running that activity.',
                },
            ],
        },
        {
            heading: {
                vi: 'Khi bạn gửi một hoạt động',
                en: 'When you submit an activity',
            },
            body: [
                {
                    vi: 'Bằng việc gửi biểu mẫu, bạn xác nhận rằng:',
                    en: 'By submitting the form, you confirm that:',
                },
            ],
            bullets: [
                {
                    vi: 'Thông tin bạn cung cấp là chính xác và cập nhật tại thời điểm gửi.',
                    en: 'The information you provide is accurate and current at the time of submission.',
                },
                {
                    vi: 'Bạn có quyền chia sẻ thông tin này, và nếu gửi thay cho một tổ chức thì bạn được tổ chức đó cho phép.',
                    en: 'You have the right to share this information, and if you are submitting on behalf of an organisation, that you are permitted to do so.',
                },
                {
                    vi: 'Bạn sở hữu hoặc có quyền sử dụng hình ảnh bạn tải lên, và hình ảnh đó không vi phạm bản quyền hay quyền hình ảnh của người khác.',
                    en: 'You own or have permission to use the photo you upload, and it does not infringe anyone’s copyright or likeness rights.',
                },
                {
                    vi: 'Bạn cho phép chúng tôi hiển thị nội dung đã gửi trên website, kể cả bản dịch tiếng Anh do hệ thống tạo ra.',
                    en: 'You allow us to display the submitted content on the site, including a machine-generated English translation.',
                },
            ],
        },
        {
            heading: {
                vi: 'Quyền kiểm duyệt của chúng tôi',
                en: 'Our moderation rights',
            },
            body: [
                {
                    vi: 'Mỗi bài gửi đều được xem xét trước khi đăng. Chúng tôi có quyền chỉnh sửa thông tin cho chính xác hoặc rõ ràng hơn (ví dụ: sửa lỗi chính tả, đổi chủ đề hoặc loại hình cho đúng), từ chối đăng, hoặc gỡ bỏ một hoạt động đã đăng, vào bất kỳ lúc nào và không cần báo trước.',
                    en: 'Every submission is reviewed before it appears. We may edit a submission for accuracy or clarity (fixing typos, correcting the topic or type), decline to publish it, or remove a published activity at any time and without notice.',
                },
                {
                    vi: 'Hoạt động đã qua hạn đăng ký sẽ tự động được đưa vào lưu trữ và không còn hiển thị công khai.',
                    en: 'Activities past their registration deadline are archived automatically and no longer shown publicly.',
                },
            ],
        },
        {
            heading: {
                vi: 'Nội dung không được phép',
                en: 'What you may not submit',
            },
            bullets: [
                {
                    vi: 'Quảng cáo sản phẩm, dịch vụ, khoá học trả phí được nguỵ trang thành hoạt động ngoại khoá.',
                    en: 'Advertisements for products, services or paid courses disguised as extracurricular activities.',
                },
                {
                    vi: 'Nội dung sai sự thật, gây hiểu nhầm, hoặc hoạt động không có thật.',
                    en: 'False or misleading content, or activities that do not exist.',
                },
                {
                    vi: 'Ngôn từ thù ghét, quấy rối, đe doạ, nội dung tình dục hoặc không phù hợp với học sinh.',
                    en: 'Hate speech, harassment, threats, sexual content, or anything unsuitable for students.',
                },
                {
                    vi: 'Thông tin cá nhân của người khác khi chưa được họ đồng ý.',
                    en: 'Other people’s personal information shared without their consent.',
                },
                {
                    vi: 'Nội dung vi phạm pháp luật Việt Nam hoặc quyền của bên thứ ba.',
                    en: 'Anything that breaks Vietnamese law or infringes a third party’s rights.',
                },
            ],
        },
        {
            heading: {
                vi: 'Chúng tôi không bảo đảm điều gì',
                en: 'No warranty',
            },
            body: [
                {
                    vi: 'Chúng tôi cố gắng kiểm duyệt mọi bài gửi, nhưng không thể xác minh tính chính xác, tính hợp pháp hay chất lượng của từng hoạt động. Thông tin trên website được cung cấp "nguyên trạng", không kèm theo bảo đảm nào.',
                    en: 'We review every submission, but we cannot verify the accuracy, legality or quality of each activity. Everything here is provided "as is", with no warranty of any kind.',
                },
                {
                    vi: 'Hãy tự tìm hiểu kỹ trước khi đăng ký, cung cấp thông tin cá nhân hoặc thanh toán bất kỳ khoản phí nào cho một đơn vị tổ chức. Chúng tôi không chịu trách nhiệm về thiệt hại phát sinh từ việc bạn tham gia một hoạt động được liệt kê trên website.',
                    en: 'Please do your own checks before registering, sharing personal information, or paying anything to an organiser. We are not responsible for losses arising from your participation in an activity listed here.',
                },
            ],
        },
        {
            heading: {
                vi: 'Quyền đối với nội dung',
                en: 'Content ownership',
            },
            body: [
                {
                    vi: 'Bạn giữ toàn bộ quyền đối với nội dung và hình ảnh bạn gửi; bạn chỉ cấp cho chúng tôi quyền hiển thị chúng trên website. Tên gọi, logo, thiết kế và mã nguồn của ECS Finder thuộc về dự án.',
                    en: 'You keep all rights to the content and photos you submit; you grant us only the right to display them on this site. The ECS Finder name, logo, design and source code belong to the project.',
                },
            ],
        },
        {
            heading: {
                vi: 'Báo cáo nội dung sai phạm',
                en: 'Reporting a listing',
            },
            body: [
                {
                    vi: `Nếu bạn phát hiện một hoạt động sai sự thật, lừa đảo, vi phạm bản quyền, hoặc muốn gỡ hoạt động do chính bạn gửi, hãy email tới ${CONTACT_EMAIL} kèm đường dẫn hoặc tên hoạt động. Chúng tôi sẽ xem xét và gỡ bỏ nếu cần.`,
                    en: `If you find a listing that is false, fraudulent or infringing, or you want an activity you submitted taken down, email ${CONTACT_EMAIL} with the link or the activity name. We will review it and remove it if warranted.`,
                },
            ],
        },
        {
            heading: {
                vi: 'Thay đổi điều khoản',
                en: 'Changes to these terms',
            },
            body: [
                {
                    vi: 'Điều khoản này có thể được cập nhật khi website thay đổi. Ngày cập nhật gần nhất luôn được ghi ở đầu trang. Việc bạn tiếp tục sử dụng website đồng nghĩa với việc chấp nhận bản cập nhật.',
                    en: 'These terms may be updated as the site changes. The date of the most recent update is always shown at the top of this page. Continuing to use the site means you accept the updated version.',
                },
            ],
        },
        {
            heading: {
                vi: 'Luật áp dụng và liên hệ',
                en: 'Governing law and contact',
            },
            body: [
                {
                    vi: `Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi câu hỏi, xin gửi về ${CONTACT_EMAIL}.`,
                    en: `These terms are governed by the laws of Vietnam. For any question, write to ${CONTACT_EMAIL}.`,
                },
            ],
        },
    ],
};

export const privacyDoc: LegalDoc = {
    updated: '18.09.2026',
    title: {
        vi: 'Chính sách quyền riêng tư',
        en: 'Privacy Policy',
    },
    intro: {
        vi: 'ECS Finder (timkiemhdnk.com) là dự án phi lợi nhuận giúp học sinh, sinh viên Việt Nam tìm kiếm hoạt động ngoại khoá. Chính sách này giải thích chúng tôi thu thập dữ liệu gì, dùng để làm gì, chia sẻ với ai và bạn có những quyền nào.',
        en: 'ECS Finder (timkiemhdnk.com) is a non-profit project helping Vietnamese students find extracurricular activities. This policy explains what data we collect, what we use it for, who we share it with, and what rights you have.',
    },
    sections: [
        {
            heading: {
                vi: 'Xem website không cần cung cấp thông tin',
                en: 'Browsing requires no personal information',
            },
            body: [
                {
                    vi: 'Bạn có thể xem toàn bộ danh sách hoạt động mà không cần đăng ký tài khoản hay cung cấp bất kỳ thông tin cá nhân nào. Dữ liệu cá nhân chỉ phát sinh khi bạn chủ động gửi một hoạt động qua biểu mẫu.',
                    en: 'You can browse every activity without creating an account or providing any personal information. Personal data only arises when you choose to submit an activity through the form.',
                },
            ],
        },
        {
            heading: {
                vi: 'Dữ liệu chúng tôi thu thập',
                en: 'What we collect',
            },
            bullets: [
                {
                    vi: 'Thông tin bạn gửi qua biểu mẫu: tên hoạt động, loại hình, chủ đề, địa điểm, hạn đăng ký, vị trí tuyển, mô tả, liên kết đăng ký, ảnh minh hoạ và địa chỉ email của bạn.',
                    en: 'What you enter in the form: activity name, type, topic, location, deadline, open roles, description, registration link, a photo, and your email address.',
                },
                {
                    vi: 'Địa chỉ IP: lưu tạm thời để giới hạn số lượt gửi (tối đa 5 lượt mỗi giờ), nhằm chống spam.',
                    en: 'Your IP address: stored temporarily to enforce a submission limit (5 per hour) and prevent spam.',
                },
                {
                    vi: 'Dữ liệu thống kê truy cập: chỉ khi bạn bấm "Đồng ý" ở thông báo cookie, Google Analytics mới được tải và ghi nhận lượt truy cập, trang đã xem và loại thiết bị ở dạng tổng hợp. Nếu bạn từ chối, chúng tôi không tải Google Analytics. Chúng tôi không dùng dữ liệu này để nhận dạng cá nhân.',
                    en: 'Analytics: only if you press "Accept" on the cookie notice does Google Analytics load and record visits, pages viewed and device type in aggregate. If you decline, we do not load it at all. We never use this data to identify individuals.',
                },
                {
                    vi: 'Lựa chọn ngôn ngữ (Tiếng Việt / English): lưu trong trình duyệt của bạn và không được gửi về máy chủ.',
                    en: 'Your language choice (Vietnamese / English): stored in your browser and never sent to our servers.',
                },
            ],
        },
        {
            heading: {
                vi: 'Chúng tôi dùng dữ liệu để làm gì',
                en: 'How we use it',
            },
            bullets: [
                {
                    vi: 'Đăng tải hoạt động của bạn lên website sau khi được duyệt.',
                    en: 'Publishing your activity on the site once it has been approved.',
                },
                {
                    vi: 'Gửi email thông báo khi bài gửi được tiếp nhận, được duyệt hoặc bị từ chối.',
                    en: 'Emailing you when a submission is received, approved or rejected.',
                },
                {
                    vi: 'Kiểm duyệt nội dung, phát hiện spam và nội dung không phù hợp.',
                    en: 'Reviewing content and detecting spam or inappropriate submissions.',
                },
                {
                    vi: 'Hiểu website đang được sử dụng ra sao để cải thiện trải nghiệm.',
                    en: 'Understanding how the site is used so we can improve it.',
                },
            ],
            body: [
                {
                    vi: 'Địa chỉ email của bạn không bao giờ hiển thị công khai. Trang danh sách hoạt động chỉ đọc các trường cần thiết để hiển thị, không bao gồm email.',
                    en: 'Your email address is never shown publicly. The public activity listing reads only the fields it needs to display, and email is not one of them.',
                },
            ],
        },
        {
            heading: {
                vi: 'Chia sẻ với bên thứ ba',
                en: 'Who else processes your data',
            },
            body: [
                {
                    vi: 'Chúng tôi không bán dữ liệu của bạn và không dùng nó cho mục đích quảng cáo. Để vận hành website, dữ liệu được xử lý bởi các nhà cung cấp dịch vụ sau, một số đặt máy chủ ngoài Việt Nam:',
                    en: 'We do not sell your data and do not use it for advertising. To run the site, data is processed by the following providers, some of them hosted outside Vietnam:',
                },
            ],
            bullets: [
                {
                    vi: 'Supabase — lưu trữ cơ sở dữ liệu và ảnh bạn tải lên.',
                    en: 'Supabase — stores the database and the photos you upload.',
                },
                {
                    vi: 'Vercel — vận hành website và ghi nhật ký truy cập kỹ thuật.',
                    en: 'Vercel — runs the site and keeps technical request logs.',
                },
                {
                    vi: 'Anthropic (Claude) — kiểm duyệt nội dung tự động và dịch phần mô tả sang tiếng Anh. Nhận tên hoạt động, mô tả, loại hình, chủ đề và liên kết đăng ký; không nhận email của bạn.',
                    en: 'Anthropic (Claude) — automated content review and translating descriptions into English. It receives the activity name, description, type, topic and registration link; it does not receive your email.',
                },
                {
                    vi: 'Telegram — gửi nội dung bài gửi tới nhóm duyệt nội bộ của chúng tôi, bao gồm cả địa chỉ email của bạn.',
                    en: 'Telegram — delivers submissions to our internal review chat, including your email address.',
                },
                {
                    vi: 'Gmail (Google) — gửi các email thông báo tới bạn; nhận địa chỉ email và nội dung thư.',
                    en: 'Gmail (Google) — delivers notification emails to you; it receives your address and the message content.',
                },
                {
                    vi: 'Cloudflare Turnstile — xác minh bạn không phải là bot; nhận địa chỉ IP của bạn.',
                    en: 'Cloudflare Turnstile — verifies you are not a bot; it receives your IP address.',
                },
                {
                    vi: 'Google Analytics — thống kê truy cập ở dạng tổng hợp.',
                    en: 'Google Analytics — aggregate traffic statistics.',
                },
            ],
        },
        {
            heading: {
                vi: 'Chúng tôi lưu dữ liệu trong bao lâu',
                en: 'How long we keep it',
            },
            bullets: [
                {
                    vi: 'Hoạt động được duyệt: lưu cho tới khi hết hạn đăng ký, sau đó được chuyển vào lưu trữ và không còn hiển thị công khai.',
                    en: 'Approved activities: kept until the registration deadline passes, then archived and no longer shown publicly.',
                },
                {
                    vi: 'Bài gửi bị từ chối: ảnh được xoá vĩnh viễn ngay khi từ chối.',
                    en: 'Rejected submissions: the photo is permanently deleted at the moment of rejection.',
                },
                {
                    vi: 'Địa chỉ IP dùng để giới hạn lượt gửi: được xoá tự động hằng ngày, chậm nhất là sau 24 giờ.',
                    en: 'IP addresses used for rate limiting: deleted automatically by a daily job, within 24 hours at the latest.',
                },
                {
                    vi: 'Email của người gửi: lưu cùng bài gửi để chúng tôi có thể liên hệ lại. Bạn có thể yêu cầu xoá bất kỳ lúc nào.',
                    en: 'Submitter email addresses: stored alongside the submission so we can contact you. You can ask us to delete it at any time.',
                },
            ],
        },
        {
            heading: {
                vi: 'Quyền của bạn',
                en: 'Your rights',
            },
            body: [
                {
                    vi: `Bạn có quyền yêu cầu xem, sửa hoặc xoá dữ liệu cá nhân của mình, rút lại sự đồng ý, và yêu cầu gỡ hoạt động bạn đã gửi. Hãy gửi email tới ${CONTACT_EMAIL} từ chính địa chỉ bạn đã dùng khi gửi bài, để chúng tôi xác minh được yêu cầu. Chúng tôi sẽ phản hồi trong thời gian sớm nhất có thể.`,
                    en: `You can ask to see, correct or delete your personal data, withdraw your consent, or have an activity you submitted taken down. Email ${CONTACT_EMAIL} from the address you used to submit, so we can verify the request. We will respond as soon as we can.`,
                },
            ],
        },
        {
            heading: {
                vi: 'Người dưới 16 tuổi',
                en: 'Users under 16',
            },
            body: [
                {
                    vi: 'Website hướng tới học sinh, sinh viên, nên một số người dùng có thể dưới 16 tuổi. Nếu bạn dưới 16 tuổi, hãy hỏi ý kiến cha mẹ hoặc người giám hộ trước khi gửi hoạt động, vì biểu mẫu có yêu cầu địa chỉ email của bạn.',
                    en: 'This site is aimed at students, so some users may be under 16. If you are under 16, please ask a parent or guardian before submitting an activity, since the form asks for your email address.',
                },
                {
                    vi: `Nếu bạn là cha mẹ hoặc người giám hộ và muốn chúng tôi xoá dữ liệu của con mình, hãy liên hệ ${CONTACT_EMAIL} và chúng tôi sẽ xoá.`,
                    en: `If you are a parent or guardian and want your child's data removed, contact ${CONTACT_EMAIL} and we will delete it.`,
                },
            ],
        },
        {
            heading: {
                vi: 'Bảo mật',
                en: 'Security',
            },
            body: [
                {
                    vi: 'Dữ liệu được lưu trên hạ tầng của Supabase và Vercel, truyền qua kết nối mã hoá HTTPS. Chỉ quản trị viên của dự án mới xem được email người gửi. Tuy nhiên, không có hệ thống nào an toàn tuyệt đối, nên chúng tôi khuyên bạn không đưa thông tin nhạy cảm vào phần mô tả hoạt động.',
                    en: 'Data is stored on Supabase and Vercel infrastructure and transmitted over encrypted HTTPS connections. Only project administrators can see submitter emails. No system is perfectly secure, though, so please do not put sensitive information in an activity description.',
                },
            ],
        },
        {
            heading: {
                vi: 'Thay đổi chính sách',
                en: 'Changes to this policy',
            },
            body: [
                {
                    vi: 'Khi website có thêm tính năng mới, chính sách này có thể được cập nhật. Ngày cập nhật gần nhất luôn được ghi ở đầu trang.',
                    en: 'As the site gains new features, this policy may be updated. The date of the most recent update is always shown at the top of this page.',
                },
            ],
        },
        {
            heading: {
                vi: 'Liên hệ',
                en: 'Contact',
            },
            body: [
                {
                    vi: `Mọi câu hỏi về chính sách này, xin gửi về ${CONTACT_EMAIL}.`,
                    en: `For any question about this policy, write to ${CONTACT_EMAIL}.`,
                },
            ],
        },
    ],
};
