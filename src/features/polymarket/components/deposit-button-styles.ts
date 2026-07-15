export const pmGhostButtonClassName =
  'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm bg-transparent text-sm font-semibold whitespace-nowrap text-muted-foreground transition duration-150 hover:bg-white/[0.06] hover:text-foreground active:scale-[97%] focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const pmPrimaryButtonClassName =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--button-primary-radius)] bg-button-primary-bg text-sm font-semibold whitespace-nowrap text-button-primary-text transition duration-150 hover:bg-button-primary-bg-hover active:scale-[97%] focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0'

export const pmPrimaryButtonMdClassName = `${pmPrimaryButtonClassName} h-9 px-4 py-2`

export const depositButtonClassName = 'pm-deposit-btn'

export const cardDepositButtonClassName = 'pm-card-deposit-btn'

export const cardWithdrawButtonClassName = 'pm-card-withdraw-btn'
