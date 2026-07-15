import { cn } from '@/lib/utils'

const avatarStyle = {
  borderRadius: '50%',
  backgroundColor: 'rgb(111, 79, 14)',
  backgroundImage:
    'radial-gradient(at 66% 77%, rgb(124, 244, 160) 0px, transparent 50%), radial-gradient(at 29% 97%, rgb(35, 172, 74) 0px, transparent 50%), radial-gradient(at 99% 86%, rgb(131, 137, 220) 0px, transparent 50%), radial-gradient(at 29% 88%, rgb(169, 131, 96) 0px, transparent 50%)',
} as const

type UserAvatarProps = {
  className?: string
  imageUrl?: string | null
}

export function UserAvatar({ className, imageUrl }: UserAvatarProps) {
  return (
    <div className={cn('size-16 overflow-hidden rounded-full', className)} style={avatarStyle}>
      {imageUrl ? (
        <img src={imageUrl} alt='' className='size-full object-cover' />
      ) : null}
    </div>
  )
}
