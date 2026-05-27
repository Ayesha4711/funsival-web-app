// Shared SVG icon components. All icons accept: size, className, color (where applicable).
// Default size is 16 unless the icon has a natural default noted below.

const svgProps = (size, className) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className,
});

// ─── Navigation / UI ──────────────────────────────────────────────────────────

export const SearchIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const BellIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const MessageIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const MenuIcon = ({ size = 22, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const CloseIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ChevronDownIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronUpIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export const ChevronRightIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ArrowRightIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const FilterIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </svg>
);

export const PlusIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const MinusIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ExportIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── User / Profile ───────────────────────────────────────────────────────────

export const UserIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const SettingsIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const LogoutIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const CameraIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const LockIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const MailIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const PhoneIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

// ─── Dashboard nav icons ──────────────────────────────────────────────────────

export const DashboardIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const ReservationsIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const ListingsIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

export const EarningsIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

// ─── Actions ──────────────────────────────────────────────────────────────────

export const EditIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const TrashIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

export const MoreVertIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export const MoreHorizIcon = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export const EyeIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const UploadIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

export const DownloadIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Status / Feedback ────────────────────────────────────────────────────────

export const CheckIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CheckCircleIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const CircleCheckIcon = ({ size = 16, color = "#22c55e", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" stroke={color} strokeWidth="2" />
    <polyline points="7 12 10.5 15.5 17 9" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CircleClockIcon = ({ size = 16, color = "#f97316", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" stroke={color} strokeWidth="2" />
    <polyline points="12 7 12 12 15.5 14" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CircleAlertIcon = ({ size = 16, color = "#ef4444", className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" stroke={color} strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="13" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.1" fill={color} />
  </svg>
);

export const InfoIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const InfoFilledIcon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="8" x2="12.01" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AlertTriangleIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const RefundIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// ─── Content / Data ───────────────────────────────────────────────────────────

export const CalendarIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const ClockIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const TagIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export const ReceiptIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const FileTextIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const TableIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="9" x2="9" y2="21" />
  </svg>
);

export const GridIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const StarIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const StarFilledIcon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const HeartIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const HeartFilledIcon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const ImageIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// ─── Location / Map ───────────────────────────────────────────────────────────

export const LocationIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const MapPinIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const GlobeIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const CompassIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

// ─── Finance ──────────────────────────────────────────────────────────────────

export const DollarIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const CreditCardIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export const BankIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="3" y="10" width="18" height="11" rx="1" />
    <path d="M3 10l9-7 9 7" />
    <line x1="9" y1="21" x2="9" y2="10" />
    <line x1="15" y1="21" x2="15" y2="10" />
  </svg>
);

// ─── Security ─────────────────────────────────────────────────────────────────

export const ShieldIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const ShieldLockIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <rect x="9" y="11" width="6" height="5" rx="1" />
    <path d="M10 11V9a2 2 0 0 1 4 0v2" />
  </svg>
);

// ─── Property / Listing ───────────────────────────────────────────────────────

export const HomeIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const BuildingIcon = ({ size = 18, className }) => (
  <svg {...svgProps(size, className)}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const ParkingIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </svg>
);

export const DrinkIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2h8l-1 7H9L8 2z" />
    <path d="M9 9c0 5 6 5 6 10" />
    <path d="M9 19h6" />
    <line x1="6" y1="22" x2="18" y2="22" />
  </svg>
);

export const FridgeIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="5" y1="10" x2="19" y2="10" />
    <line x1="9" y1="6" x2="9" y2="8" />
    <line x1="9" y1="14" x2="9" y2="18" />
  </svg>
);

export const WifiIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" fill="#6B7280" />
  </svg>
);

export const FoodIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

export const IronIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 20h16" />
    <path d="M6 20V10a6 6 0 0 1 12 0v2H6" />
    <line x1="12" y1="4" x2="12" y2="7" />
  </svg>
);

export const FirstAidIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const WasherIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <circle cx="12" cy="13" r="4" />
    <circle cx="8" cy="6" r="1" fill="#6B7280" />
  </svg>
);

// ─── Social / Google ──────────────────────────────────────────────────────────

export const GoogleIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const ShareIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const LinkIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const ZoomInIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const ZoomOutIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const SendIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const PaperclipIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export const EmojiIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

export const RepeatIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

export const UsersIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const TrendingUpIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const SpinnerIcon = ({ size = 14, className, color = "currentColor" }) => (
  <svg className={`animate-spin ${className ?? ""}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
  </svg>
);

export const LayersIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size, className)}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

// ─── Social ───────────────────────────────────────────────────────────────────

export const InstagramIcon = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

export const XTwitterIcon = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.126 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const YoutubeIcon = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// ─── Form / Input ─────────────────────────────────────────────────────────────

export const CityIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const TruckIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7h13l3 4v6H3z" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

// ─── Messaging ────────────────────────────────────────────────────────────────

export const SingleTickIcon = ({ size = 12, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DoubleTickIcon = ({ size = 16, blue = false, className }) => (
  <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 20 16" fill="none" className={className}>
    <path d="M1 8l4 4 8-8" stroke={blue ? "#4AA7A7" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 8l4 4 8-8" stroke={blue ? "#4AA7A7" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const NoMessagesIcon = ({ size = 80, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <ellipse cx="50" cy="45" rx="34" ry="28" fill="#e8edf0" />
    <ellipse cx="32" cy="60" rx="20" ry="16" fill="#d4dde3" />
    <circle cx="50" cy="55" r="16" fill="#8fa3b0" />
    <circle cx="50" cy="55" r="9" fill="white" />
    <line x1="46" y1="51" x2="54" y2="59" stroke="#8fa3b0" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="46" y1="51" x2="46" y2="45" stroke="#8fa3b0" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ─── Misc / Diagonal arrow ────────────────────────────────────────────────────

export const ArrowUpRightIcon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

// ─── Empty state icons ────────────────────────────────────────────────────────

export const NoListingIcon = ({ size = 42, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="2" width="12" height="18" rx="2" fill="#2a9d8f" opacity="0.15"/>
    <rect x="4" y="2" width="12" height="18" rx="2" stroke="#2a9d8f" strokeWidth="1.5"/>
    <path d="M8 7h5M8 11h5M8 15h3" stroke="#2a9d8f" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="12" y="13" width="8" height="8" rx="2" fill="#2a9d8f"/>
    <path d="M16 15.5v3M14.5 17h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const NoListingFilteredIcon = ({ size = 42, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" fill="#2a9d8f" opacity="0.15" stroke="#2a9d8f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="4" y1="4" x2="20" y2="20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const PlayIcon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// ─── Activity-type tab icons ──────────────────────────────────────────────────
// All accept size + className so callers can control active/inactive colour.

export const SkydivingIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v5M7 10c1.5 1 3 1.5 5 1.5S16.5 11 18 10" />
    <path d="M9 20l3-8 3 8" />
    <path d="M7 20h10" />
  </svg>
);

export const JetSkiingIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 17c2-2 4-3 6-3s4 2 6 2 4-1 6-3" />
    <path d="M5 14l3-5h4l3 3" />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
  </svg>
);

export const ScubaDivingIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M9 12a3 3 0 0 0 3 3" />
    <path d="M7 8c-1 1-2 3-2 4s1 3 2 4" />
    <path d="M17 8c1 1 2 3 2 4s-1 3-2 4" />
    <path d="M12 5v2M12 17v2" />
    <rect x="14" y="3" width="3" height="6" rx="1" />
  </svg>
);

export const JeepRallyIcon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="8" width="20" height="9" rx="2" />
    <path d="M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
    <circle cx="7" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
    <path d="M9 8h6" />
  </svg>
);

// ─── Location pin (teal-accent variant used in ActivityCard) ──────────────────
export const LocationPinIcon = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ─── Filters / sort icon (ActivityFilters filter button) ──────────────────────
export const SortFilterIcon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 4h18M6 8h12M9 12h6M11 16h2" />
  </svg>
);

// ─── Brand payment icons ──────────────────────────────────────────────────────

export const VisaIcon = ({ className }) => (
  <svg className={`w-10 h-6 ${className ?? ""}`} viewBox="0 0 60 20" fill="none">
    <text x="0" y="16" fontSize="16" fontWeight="bold" fill="#1A1F71" fontFamily="Arial">VISA</text>
  </svg>
);

export const MastercardIcon = ({ className }) => (
  <svg className={`w-8 h-5 ${className ?? ""}`} viewBox="0 0 50 30" fill="none">
    <circle cx="18" cy="15" r="13" fill="#EB001B" />
    <circle cx="32" cy="15" r="13" fill="#F79E1B" />
    <path d="M25 5.8A13 13 0 0132 15a13 13 0 01-7 9.2A13 13 0 0118 15a13 13 0 017-9.2z" fill="#FF5F00" />
  </svg>
);

// ─── Celebration illustration ─────────────────────────────────────────────────

export const CelebrationIllustration = ({ className }) => (
  <svg
    width="180"
    height="220"
    viewBox="0 0 180 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`mx-auto${className ? ` ${className}` : ""}`}
  >
    {/* Confetti pieces */}
    <circle cx="30" cy="40" r="5" fill="#F5C842" opacity="0.9"/>
    <circle cx="150" cy="30" r="4" fill="#4DB6AC" opacity="0.9"/>
    <rect x="140" y="55" width="8" height="8" rx="2" fill="#F5C842" transform="rotate(30 144 59)"/>
    <rect x="20" y="70" width="7" height="7" rx="1.5" fill="#4DB6AC" transform="rotate(-20 23 73)"/>
    <circle cx="160" cy="80" r="3.5" fill="#EF5350" opacity="0.8"/>
    <circle cx="18" cy="105" r="3" fill="#7C4DFF" opacity="0.8"/>
    <rect x="155" y="100" width="6" height="6" rx="1.5" fill="#F5C842" transform="rotate(15 158 103)"/>
    <rect x="10" y="130" width="5" height="9" rx="1" fill="#4DB6AC" transform="rotate(-10 12 134)"/>
    <circle cx="165" cy="130" r="4" fill="#F5C842" opacity="0.9"/>
    <rect x="25" y="155" width="7" height="7" rx="2" fill="#EF5350" transform="rotate(25 28 158)"/>
    <circle cx="155" cy="160" r="3" fill="#4DB6AC" opacity="0.8"/>
    {/* Arms raised — left */}
    <path d="M72 110 C60 100 48 88 42 78" stroke="#5C3D1E" strokeWidth="10" strokeLinecap="round"/>
    {/* Arms raised — right */}
    <path d="M108 110 C120 100 132 88 138 78" stroke="#5C3D1E" strokeWidth="10" strokeLinecap="round"/>
    {/* Body — yellow coat */}
    <path d="M72 130 L70 185 Q90 195 110 185 L108 130 Q90 122 72 130Z" fill="#F5C842"/>
    {/* Coat lapels / collar */}
    <path d="M85 130 L90 145 L95 130" stroke="#E0A800" strokeWidth="2" fill="none" strokeLinejoin="round"/>
    {/* Legs — purple */}
    <rect x="76" y="183" width="14" height="30" rx="7" fill="#5C35B5"/>
    <rect x="90" y="183" width="14" height="30" rx="7" fill="#5C35B5"/>
    {/* Shoes */}
    <ellipse cx="83" cy="213" rx="10" ry="6" fill="#3D2080"/>
    <ellipse cx="97" cy="213" rx="10" ry="6" fill="#3D2080"/>
    {/* Neck */}
    <rect x="84" y="115" width="12" height="16" rx="6" fill="#D4956A"/>
    {/* Head */}
    <circle cx="90" cy="98" r="22" fill="#D4956A"/>
    {/* Eyes — happy closed curves */}
    <path d="M82 95 Q85 91 88 95" stroke="#3D2080" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M92 95 Q95 91 98 95" stroke="#3D2080" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* Smile */}
    <path d="M83 103 Q90 110 97 103" stroke="#3D2080" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* Hair / hat brim */}
    <ellipse cx="90" cy="77" rx="23" ry="8" fill="#3D2080"/>
    {/* Hat body */}
    <rect x="74" y="57" width="32" height="22" rx="6" fill="#5C35B5"/>
    {/* Hat decoration star */}
    <circle cx="90" cy="68" r="4" fill="#F5C842"/>
  </svg>
);
