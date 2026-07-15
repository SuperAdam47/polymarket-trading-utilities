type PortfolioCopyIconProps = {
  className?: string
}

export function PortfolioCopyIcon({ className }: PortfolioCopyIconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 18 18'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <circle
        cx='9'
        cy='6.5'
        r='2'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <path
        d='M5.402 13.25c.649-1.332 2.016-2.25 3.598-2.25s2.949.918 3.598 2.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <path
        d='M15.75 11.75v2c0 1.105-.895 2-2 2h-2'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <path
        d='M6.25 15.75h-2c-1.105 0-2-.895-2-2v-2'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <path
        d='M2.25 6.25v-2c0-1.105.895-2 2-2h2'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <path
        d='M11.75 2.25h2c1.105 0 2 .895 2 2v2'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function PortfolioHideBalanceIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 18 18'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <path
        d='M4.8077 13.1923C3.4687 12.267 2.56488 11.0325 2.04418 10.1133C1.65178 9.42061 1.65178 8.57951 2.04418 7.88681C2.99118 6.21511 5.2055 3.50009 8.9999 3.50009C10.708 3.50009 12.0959 4.0503 13.1921 4.8078'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M15.327 6.9151C15.578 7.2579 15.7869 7.58889 15.9556 7.88669C16.348 8.57939 16.348 9.42049 15.9556 10.1132C15.0086 11.7849 12.7943 14.4999 8.99994 14.4999C8.59234 14.4999 8.20304 14.4686 7.83154 14.4106'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M7.05551 10.9446C6.55781 10.4469 6.25 9.7594 6.25 9C6.25 7.4812 7.4812 6.25 9 6.25C9.7594 6.25 10.4469 6.55779 10.9445 7.05539'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M2 16L16 2'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function PortfolioDepositIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 20 20'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <path
        fill='currentColor'
        d='M16.25 15.375a.875.875 0 0 1 0 1.75H3.75a.875.875 0 0 1 0-1.75zM10 2.875c.483 0 .875.392.875.875v7.387l2.506-2.506a.876.876 0 0 1 1.238 1.238l-4 4a.9.9 0 0 1-.257.177l-.027.012a.87.87 0 0 1-.67 0 .9.9 0 0 1-.284-.189l-4-4a.876.876 0 0 1 1.238-1.238l2.506 2.506V3.75c0-.483.392-.875.875-.875'
      />
    </svg>
  )
}

function PortfolioWithdrawIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 20 20'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <path
        fill='currentColor'
        d='M16.25 15.375a.875.875 0 0 1 0 1.75H3.75a.875.875 0 0 1 0-1.75zM10.028 2.876l.03.002a1 1 0 0 1 .134.018l.015.004a.87.87 0 0 1 .412.23l4 4a.876.876 0 0 1-1.238 1.24l-2.506-2.507v7.387a.875.875 0 0 1-1.75 0V5.863L6.619 8.37a.876.876 0 0 1-1.238-1.238l4-4 .066-.06a.9.9 0 0 1 .275-.151l.012-.004a1 1 0 0 1 .14-.031l.018-.003A1 1 0 0 1 10 2.875z'
      />
    </svg>
  )
}

function ProfileEditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18' fill='none' aria-hidden='true' className={className}>
      <line x1='10.547' y1='4.422' x2='13.578' y2='7.453' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' />
      <path d='M2.75,15.25s3.599-.568,4.546-1.515c.947-.947,7.327-7.327,7.327-7.327,.837-.837,.837-2.194,0-3.03-.837-.837-2.194-.837-3.03,0,0,0-6.38,6.38-7.327,7.327s-1.515,4.546-1.515,4.546h0Z' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' />
    </svg>
  )
}

function ProfileShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18' fill='none' aria-hidden='true' className={className}>
      <path d='M15.25,11.75v1.5c0,1.105-.895,2-2,2H4.75c-1.105,0-2-.895-2-2v-1.5' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' />
      <polyline points='12.5 6.25 9 2.75 5.5 6.25' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' />
      <line x1='9' y1='2.75' x2='9' y2='10.25' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' />
    </svg>
  )
}

export {
  PortfolioHideBalanceIcon,
  PortfolioDepositIcon,
  PortfolioWithdrawIcon,
  ProfileEditIcon,
  ProfileShareIcon,
}
