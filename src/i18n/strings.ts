import type { Lang } from '@/types';

// Vietnamese is the base table and defines every key. English is Partial so keys
// can land here one screen at a time, and so `.one`/`.other` plural variants —
// which Vietnamese has no need for — are not type errors.
export const vi = {
    'nav.home': 'Trang chủ',
    'nav.submit': 'Đăng hoạt động',
    'nav.openMenu': 'Mở menu',
    'nav.closeMenu': 'Đóng menu',
    'nav.menu': 'Menu',
    'nav.language': 'Ngôn ngữ',

    'filters.title': 'Bộ lọc',
    'filters.clearAll': 'Xoá tất cả',
    'filters.category': 'Loại hình',
    'filters.deadline': 'Hạn đăng ký',
    'filters.topics': 'Chủ đề',
    'filters.positions': 'Vị trí tuyển',
    'filters.all': 'Tất cả',
    'filters.thisWeek': 'Trong tuần này',
    'filters.thisMonth': 'Trong tháng này',
    'filters.collapseTopic': 'Thu gọn {topic}',
    'filters.expandTopic': 'Mở rộng {topic}',
    'filters.viewResults': 'Xem {count} kết quả',

    'results.filtered': 'Kết quả lọc',
    'results.all': 'Tất cả hoạt động',
    'results.openCount': '{count} hoạt động đang mở đăng ký',
    'results.page': 'Trang {page}/{total}',

    'card.closed': 'Đã đóng',
    'card.daysLeft': '{count} ngày',
    'card.positionsInline': 'Vị trí: ',
    'card.empty.title': 'Không tìm thấy hoạt động',
    'card.empty.body': 'Thử điều chỉnh bộ lọc hoặc từ khoá tìm kiếm.',
    'card.page': 'Trang {page}',
    'card.prevPage': 'Trang trước',
    'card.nextPage': 'Trang sau',

    'modal.close': 'Đóng',
    'modal.location': 'Địa điểm',
    'modal.deadline': 'Hạn đăng ký',
    'modal.topic': 'Chủ đề',
    'modal.tags': 'Thẻ',
    'modal.positions': 'Vị trí tuyển',
    'modal.register': 'Đăng ký ngay',

    'hero.title.before': 'Trải nghiệm hết nấc\nnhững',
    'hero.title.typed': 'ngoại khóa',
    'hero.title.after': 'chất',
    'hero.subtitle': 'Khám phá câu lạc bộ, cuộc thi, dự án và sự kiện dành cho học sinh, sinh viên trên khắp Việt Nam.',
    'hero.randomTopic': 'Chọn chủ đề ngẫu nhiên',
    'hero.random': 'Ngẫu nhiên',

    'search.label': 'Tìm kiếm hoạt động',
    'search.placeholder': 'Tìm câu lạc bộ, cuộc thi, dự án, sự kiện...',
    'search.results': '{count} kết quả',

    'footer.tagline': 'Khám phá hoạt động ngoại khoá dành cho học sinh & sinh viên Việt Nam.',
    'footer.contact': 'Liên hệ',
    'footer.copyEmail': 'Sao chép địa chỉ email',
    'footer.responseTime': 'Phản hồi trong vòng 24 giờ',
    'footer.forStudents': 'Dành cho học sinh & sinh viên Việt Nam',

    'submit.title': 'Đăng hoạt động của bạn',
    'submit.name': 'Tên hoạt động',
    'submit.category': 'Danh mục',
    'submit.categoryPlaceholder': 'Chọn danh mục...',
    'submit.topic': 'Chủ đề',
    'submit.topicPlaceholder': 'Chọn chủ đề...',
    'submit.subtopic': 'Chủ đề con',
    'submit.subtopicNone': 'Không có',
    'submit.location': 'Địa điểm',
    'submit.deadline': 'Hạn nộp',
    'submit.positions': 'Vị trí tuyển',
    'submit.positionsPlaceholder': 'Chọn vị trí tuyển...',
    'submit.desc': 'Mô tả',
    'submit.wordCount': '{count} / {max} từ',
    'submit.image': 'Ảnh hoạt động',
    'submit.chooseImage': 'Chọn ảnh...',
    'submit.removeImage': 'Xoá ảnh',
    'submit.imageHint': 'JPEG, PNG hoặc WebP · tối đa 5MB',
    'submit.link': 'Liên kết đăng ký (URL)',
    'submit.email': 'Email liên hệ',
    'submit.emailHint': 'Chỉ dùng để báo kết quả duyệt, không hiển thị công khai.',
    'submit.submitting': 'Đang gửi...',
    'submit.submitButton': 'Gửi hoạt động',
    'submit.successTitle': 'Đã gửi hoạt động!',
    'submit.successBody': 'Hoạt động của bạn đang chờ duyệt. Tụi mình đã gửi email xác nhận, và sẽ báo lại cho bạn khi có kết quả.',
    'submit.submitAnother': 'Đăng hoạt động khác',
    'submit.browse': 'Xem các hoạt động',
    'submit.crop.zoom': 'Phóng to',
    'submit.crop.zoomImage': 'Phóng to ảnh',
    'submit.crop.hint': 'Kéo để chọn khung ảnh · cuộn để phóng to',

    'preview.namePlaceholder': 'Tên hoạt động của bạn...',
    'preview.dropHint': 'Nhấn hoặc kéo ảnh vào đây',
    'preview.previewFailed': 'Không thể xem trước ảnh này',

    'error.required': 'Bắt buộc nhập',
    'error.requiredSelect': 'Bắt buộc chọn',
    'error.link.invalid': 'Đường dẫn không hợp lệ',
    'error.email.invalid': 'Email không hợp lệ',
    'error.email.invalidServer': 'Email không hợp lệ, vui lòng kiểm tra lại',
    'error.email.unknownDomain': 'Tên miền email không tồn tại, vui lòng kiểm tra lại',
    'error.desc.tooLong': 'Tối đa {max} từ',
    'error.image.required': 'Bắt buộc chọn ảnh',
    'error.image.tooMany': 'Chỉ có thể tải lên 1 ảnh',
    'error.image.heic': 'Ảnh HEIC (iPhone) chưa được hỗ trợ, vui lòng chọn JPEG/PNG/WebP',
    'error.image.badType': 'Chỉ chấp nhận JPEG, PNG hoặc WebP',
    'error.image.tooLarge': 'Ảnh quá lớn ({size}), tối đa 5MB',
    'error.turnstile.missing': 'Vui lòng xác minh bạn không phải robot.',
    'error.network': 'Không thể kết nối tới máy chủ, vui lòng thử lại.',
    'error.generic': 'Gửi không thành công, vui lòng thử lại.',
    'error.form.verifyFailed': 'Xác minh không thành công, vui lòng thử lại.',
    'error.form.missingFields': 'Vui lòng điền đầy đủ các trường bắt buộc.',
    'error.form.duplicateCheck': 'Không thể kiểm tra trùng lặp, vui lòng thử lại.',
    'error.form.inappropriate': 'Nội dung không phù hợp, vui lòng chỉnh sửa và gửi lại.',
    'error.form.rateLimited': 'Bạn đã gửi quá nhiều hoạt động. Vui lòng thử lại sau.',
    'error.form.saveFailed': 'Không thể lưu hoạt động, vui lòng thử lại.',
    'error.name.duplicate': 'Hoạt động này đã được gửi trước đó.',
    'error.image.chooseOne': 'Vui lòng chọn một ảnh.',
    'error.image.tooLargeServer': 'Ảnh không được vượt quá 5MB.',
    'error.image.invalidFile': 'Tệp không phải là ảnh hợp lệ (JPEG, PNG, WebP).',
    'error.image.uploadFailed': 'Không thể tải ảnh lên, vui lòng thử lại.',
    'error.positions.invalidData': 'Dữ liệu vị trí không hợp lệ.',
    'error.positions.invalid': 'Vị trí không hợp lệ.',
    'error.category.invalid': 'Danh mục không hợp lệ.',
    'error.topic.invalid': 'Chủ đề không hợp lệ.',
    'error.subtopic.invalid': 'Chủ đề con không hợp lệ.',
    'error.link.invalidServer': 'Liên kết đăng ký không hợp lệ.',
    'error.deadline.invalid': 'Ngày hạn nộp không hợp lệ.',
} as const;

export type StringKey = keyof typeof vi;
type PluralKey = `${StringKey}.one` | `${StringKey}.other`;

export const en: Partial<Record<StringKey | PluralKey, string>> = {
    'nav.home': 'Home',
    'nav.submit': 'Submit an activity',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',
    'nav.menu': 'Menu',
    'nav.language': 'Language',

    'filters.title': 'Filters',
    'filters.clearAll': 'Clear all',
    'filters.category': 'Type',
    'filters.deadline': 'Deadline',
    'filters.topics': 'Topics',
    'filters.positions': 'Open roles',
    'filters.all': 'All',
    'filters.thisWeek': 'This week',
    'filters.thisMonth': 'This month',
    'filters.collapseTopic': 'Collapse {topic}',
    'filters.expandTopic': 'Expand {topic}',
    'filters.viewResults.one': 'View {count} result',
    'filters.viewResults.other': 'View {count} results',

    'results.filtered': 'Filtered results',
    'results.all': 'All activities',
    'results.openCount.one': '{count} activity open for registration',
    'results.openCount.other': '{count} activities open for registration',
    'results.page': 'Page {page} of {total}',

    'card.closed': 'Closed',
    'card.daysLeft.one': '{count} day',
    'card.daysLeft.other': '{count} days',
    'card.positionsInline': 'Roles: ',
    'card.empty.title': 'No activities found',
    'card.empty.body': 'Try adjusting your filters or search terms.',
    'card.page': 'Page {page}',
    'card.prevPage': 'Previous page',
    'card.nextPage': 'Next page',

    'modal.close': 'Close',
    'modal.location': 'Location',
    'modal.deadline': 'Deadline',
    'modal.topic': 'Topic',
    'modal.tags': 'Tags',
    'modal.positions': 'Open roles',
    'modal.register': 'Register now',

    'hero.title.before': 'Find your',
    'hero.title.typed': 'extracurriculars',
    'hero.title.after': '\n the easy way',
    'hero.subtitle': 'Discover clubs, competitions, projects and events for students across Vietnam.',
    'hero.randomTopic': 'Pick a random topic',
    'hero.random': 'Random',

    'search.label': 'Search activities',
    'search.placeholder': 'Search clubs, competitions, projects, events...',
    'search.results.one': '{count} result',
    'search.results.other': '{count} results',

    'footer.tagline': 'Discover extracurricular activities for students in Vietnam.',
    'footer.contact': 'Contact',
    'footer.copyEmail': 'Copy email address',
    'footer.responseTime': 'Replies within 24 hours',
    'footer.forStudents': 'For students in Vietnam',

    'submit.title': 'Submit your activity',
    'submit.name': 'Activity name',
    'submit.category': 'Category',
    'submit.categoryPlaceholder': 'Choose a category...',
    'submit.topic': 'Topic',
    'submit.topicPlaceholder': 'Choose a topic...',
    'submit.subtopic': 'Subtopic',
    'submit.subtopicNone': 'None',
    'submit.location': 'Location',
    'submit.deadline': 'Deadline',
    'submit.positions': 'Open roles',
    'submit.positionsPlaceholder': 'Choose open roles...',
    'submit.desc': 'Description',
    'submit.wordCount': '{count} / {max} words',
    'submit.image': 'Activity photo',
    'submit.chooseImage': 'Choose a photo...',
    'submit.removeImage': 'Remove photo',
    'submit.imageHint': 'JPEG, PNG or WebP · 5MB max',
    'submit.link': 'Registration link (URL)',
    'submit.email': 'Contact email',
    'submit.emailHint': 'Only used to tell you the review result. Never shown publicly.',
    'submit.submitting': 'Submitting...',
    'submit.submitButton': 'Submit activity',
    'submit.successTitle': 'Activity submitted!',
    'submit.successBody': 'Your activity is awaiting review. We have sent you a confirmation email, and will let you know the result.',
    'submit.submitAnother': 'Submit another activity',
    'submit.browse': 'Browse activities',
    'submit.crop.zoom': 'Zoom',
    'submit.crop.zoomImage': 'Zoom the photo',
    'submit.crop.hint': 'Drag to frame the photo · scroll to zoom',

    'preview.namePlaceholder': 'Your activity name...',
    'preview.dropHint': 'Click or drag a photo here',
    'preview.previewFailed': 'This photo could not be previewed',

    'error.required': 'Required',
    'error.requiredSelect': 'Required',
    'error.link.invalid': 'Not a valid link',
    'error.email.invalid': 'Not a valid email address',
    'error.email.invalidServer': 'Not a valid email address - please check it',
    'error.email.unknownDomain': 'That email domain does not exist - please check it',
    'error.desc.tooLong': '{max} words maximum',
    'error.image.required': 'A photo is required',
    'error.image.tooMany': 'Only one photo can be uploaded',
    'error.image.heic': 'HEIC photos (iPhone) are not supported - please use JPEG/PNG/WebP',
    'error.image.badType': 'Only JPEG, PNG or WebP are accepted',
    'error.image.tooLarge': 'Photo too large ({size}), 5MB maximum',
    'error.turnstile.missing': 'Please confirm you are not a robot.',
    'error.network': 'Could not reach the server, please try again.',
    'error.generic': 'Submission failed, please try again.',
    'error.form.verifyFailed': 'Verification failed, please try again.',
    'error.form.missingFields': 'Please fill in all required fields.',
    'error.form.duplicateCheck': 'Could not check for duplicates, please try again.',
    'error.form.inappropriate': 'This content is not appropriate - please edit it and resubmit.',
    'error.form.rateLimited': 'You have submitted too many activities. Please try again later.',
    'error.form.saveFailed': 'Could not save the activity, please try again.',
    'error.name.duplicate': 'This activity has already been submitted.',
    'error.image.chooseOne': 'Please choose a photo.',
    'error.image.tooLargeServer': 'The photo must not exceed 5MB.',
    'error.image.invalidFile': 'That file is not a valid image (JPEG, PNG, WebP).',
    'error.image.uploadFailed': 'Could not upload the photo, please try again.',
    'error.positions.invalidData': 'Invalid role data.',
    'error.positions.invalid': 'Invalid role.',
    'error.category.invalid': 'Invalid category.',
    'error.topic.invalid': 'Invalid topic.',
    'error.subtopic.invalid': 'Invalid subtopic.',
    'error.link.invalidServer': 'Invalid registration link.',
    'error.deadline.invalid': 'Invalid deadline date.',
};

export type Vars = Record<string, string | number>;

// Narrows an untrusted value (an error code from /api/submit) to a real key.
export function isStringKey(value: unknown): value is StringKey {
    return typeof value === 'string' && value in vi;
}

const TABLES: Record<Lang, Partial<Record<StringKey | PluralKey, string>>> = { VI: vi, EN: en };

// `{name}` braces match next-intl's syntax, so these values would migrate to it
// unchanged if English ever needs its own URLs.
function interpolate(template: string, vars?: Vars): string {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
        name in vars ? String(vars[name]) : whole,
    );
}

export function translate(lang: Lang, key: StringKey, vars?: Vars): string {
    const table = TABLES[lang];

    // A `count` var opts the key into plurals: 'x.one' for exactly 1, 'x.other'
    // otherwise — so 0 correctly takes the plural form.
    const plural = typeof vars?.count === 'number'
        ? (`${key}.${vars.count === 1 ? 'one' : 'other'}` as PluralKey)
        : null;

    const found =
        (plural && table[plural]) ||
        table[key] ||
        (plural && vi[plural as unknown as StringKey]) ||
        vi[key];

    if (!found) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[i18n] missing string for "${key}" (${lang})`);
        }
        return key;
    }

    return interpolate(found, vars);
}
