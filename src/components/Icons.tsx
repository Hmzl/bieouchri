import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function I({ size = 22, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export function IconHome(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </I>
  )
}

export function IconBox(p: IconProps) {
  return (
    <I {...p}>
      <path d="M21 8.5 12 4 3 8.5v7L12 20l9-4.5z" />
      <path d="M3 8.5 12 13l9-4.5M12 13v7" />
    </I>
  )
}

export function IconCart(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h9.4a1.5 1.5 0 0 0 1.5-1.2L21 8H7" />
    </I>
  )
}

export function IconChart(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15v-4M12 15V8M16 15v-7" />
    </I>
  )
}

export function IconCog(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </I>
  )
}

export function IconPlus(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 5v14M5 12h14" />
    </I>
  )
}

export function IconSearch(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.2-3.2" />
    </I>
  )
}

export function IconCamera(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </I>
  )
}

export function IconImage(p: IconProps) {
  return (
    <I {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.4" />
      <path d="m21 16-5.5-5.5-8.5 8" />
    </I>
  )
}

export function IconEdit(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13 7 4 4" />
    </I>
  )
}

export function IconTrash(p: IconProps) {
  return (
    <I {...p}>
      <path d="M5 7h14M10 7V5h4v2M8 7l1 12h6l1-12" />
    </I>
  )
}

export function IconPin(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </I>
  )
}

export function IconCheck(p: IconProps) {
  return (
    <I {...p}>
      <path d="m5 12 5 5 9-10" />
    </I>
  )
}

export function IconAlert(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 4.8 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0z" />
    </I>
  )
}

export function IconPrint(p: IconProps) {
  return (
    <I {...p}>
      <path d="M7 17h10v4H7zM7 9V4h10v5" />
      <path d="M5 9h14a2 2 0 0 1 2 2v4H3v-4a2 2 0 0 1 2-2z" />
    </I>
  )
}

export function IconPhone(p: IconProps) {
  return (
    <I {...p}>
      <path d="M7 3h4l1.5 4-2.5 1.5a12 12 0 0 0 5.5 5.5L17 11.5 21 13v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </I>
  )
}

export function IconUser(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </I>
  )
}

export function IconClose(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </I>
  )
}

export function IconWhatsApp(p: IconProps) {
  return (
    <I {...p}>
      <path d="M20 11.5A8.5 8.5 0 0 1 7.4 18.7L4 20l1.4-3.3A8.5 8.5 0 1 1 20 11.5z" />
      <path d="M9.2 8.6c.2-.4.4-.4.7-.4h.6c.2 0 .4 0 .5.4l.8 1.9c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5.4.7 1.1 1.4 1.9 1.9.2.1.4.1.5 0l.6-.5c.2-.2.4-.2.6-.1l1.9.8c.4.1.4.3.4.5v.6c0 .3 0 .5-.4.7A4.6 4.6 0 0 1 14 16.5 6.8 6.8 0 0 1 8 10.6c.1-.5.3-.8.6-1.1z" />
    </I>
  )
}

export function IconReceipt(p: IconProps) {
  return (
    <I {...p}>
      <path d="M7 3h10v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </I>
  )
}

export function IconBack(p: IconProps) {
  return (
    <I {...p}>
      <path d="M15 5 8 12l7 7" />
    </I>
  )
}

export function IconStore(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 10 6 5h12l2 5v9H4z" />
      <path d="M4 10h16M9 19v-5h6v5" />
    </I>
  )
}

export function IconBag(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 8h12l-1 13H7z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </I>
  )
}

export function IconMinus(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 12h12" />
    </I>
  )
}

export function IconRefresh(p: IconProps) {
  return (
    <I {...p}>
      <path d="M20 12a8 8 0 1 1-2.2-5.5" />
      <path d="M20 5v5h-5" />
    </I>
  )
}

export function IconShare(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 12v8h16v-8M16 6l-4-4-4 4M12 2v14" />
    </I>
  )
}

export function IconDownload(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 3v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 21h14" />
    </I>
  )
}

export const IconMap = IconPin
export const IconFile = IconReceipt
export const IconSettings = IconCog
