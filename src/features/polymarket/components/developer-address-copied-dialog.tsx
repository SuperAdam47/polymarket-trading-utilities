import { useCallback, useState, type MouseEvent } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

function ModalCloseIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
      aria-hidden='true'
    >
      <line
        x1='14'
        y1='4'
        x2='4'
        y2='14'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <line
        x1='4'
        y1='4'
        x2='14'
        y2='14'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

type DeveloperAddressCopiedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeveloperAddressCopiedDialog({
  open,
  onOpenChange,
}: DeveloperAddressCopiedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='z-[250] w-full min-w-0 max-w-sm gap-4 overflow-hidden rounded-3xl border p-6 shadow-lg sm:max-w-sm'
      >
        <div className='flex items-center'>
          <DialogTitle className='text-xl font-semibold'>
            Developer address copied
          </DialogTitle>
          <DialogClose asChild>
            <button
              type='button'
              className='ml-auto shrink-0 cursor-pointer rounded-sm p-1 text-muted-foreground transition-colors duration-200 hover:text-foreground'
              aria-label='Close'
            >
              <ModalCloseIcon />
            </button>
          </DialogClose>
        </div>

        <DialogDescription className='pm-dev-address-modal-desc -mt-1 text-sm font-medium text-[var(--pm-text-secondary)] [&_strong]:font-semibold [&_strong]:text-[var(--pm-text-emphasis)]'>
          Sending funds here will{' '}
          <strong>lose them permanently</strong>. To add funds, use the{' '}
          <strong>Deposit</strong> button.
        </DialogDescription>

        <div className='flex w-full items-center gap-2 [&>*]:h-11 [&>*]:flex-1'>
          <DialogClose asChild>
            <button
              type='button'
              className='inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-button-primary-bg text-sm font-semibold text-button-primary-text transition duration-150 hover:bg-button-primary-bg-hover active:scale-[0.97]'
            >
              Got it
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function useCopyDeveloperAddress(address: string) {
  const [open, setOpen] = useState(false)

  const copyAddress = useCallback(
    async (event?: MouseEvent) => {
      event?.preventDefault()
      event?.stopPropagation()
      await navigator.clipboard.writeText(address)
      setOpen(true)
    },
    [address]
  )

  const dialog = (
    <DeveloperAddressCopiedDialog open={open} onOpenChange={setOpen} />
  )

  return { copyAddress, dialog }
}
