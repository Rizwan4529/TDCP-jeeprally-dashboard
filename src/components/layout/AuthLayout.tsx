import type { ReactNode } from "react"

import { Typography } from "@/components/common/Typography"
import Logo from "@/assets/icons/logo.png"
import AUTH_IMAGE_URL from "@/assets/images/auth-layout-img-left.png"
// const AUTH_IMAGE_URL =
//   "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85"

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <main className="grid h-svh overflow-hidden bg-[#FDFDFE] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
      <section className="h-svh overflow-y-auto px-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-full w-full max-w-[470px] flex-col justify-center py-8">
          <div className="mb-8 flex items-center gap-3 sm:mb-10">
            <img src={Logo} alt="Jeep Rally" className="size-14 object-contain" />
            <div>
              <Typography
                as="span"
                variant="h6"
                className="block leading-none text-[#00571C]"
              >
                Jeep Rally
              </Typography>
              <Typography
                as="span"
                variant="caption"
                className="mt-1 block text-[#6B7890]"
              >
                Driver Portal
              </Typography>
            </div>
          </div>

          <div className="space-y-3">
            <Typography
              as="h1"
              variant="h2"
              className="text-[34px] font-semibold leading-tight text-[#1F1838] sm:text-[42px]"
            >
              {title}
            </Typography>
            <Typography
              variant="body"
              className="max-w-[390px] text-[16px] leading-[1.6] text-[#6B7280]"
            >
              {subtitle}
            </Typography>
          </div>

          <div className="mt-7 sm:mt-9">{children}</div>
        </div>
      </section>

      <section className="relative hidden h-svh overflow-hidden lg:block">
        <img
          src={AUTH_IMAGE_URL}
          alt="Rally vehicle on the road"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#06140D]/75 via-[#06140D]/25 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-[520px]">
          <Typography
            as="span"
            variant="overline"
            className="text-white/75"
          >
            TDCP Jeep Rally
          </Typography>
          <Typography
            as="h2"
            variant="h3"
            className="mt-3 text-[38px] font-semibold leading-tight text-white"
          >
            Drive the rally forward.
          </Typography>
        </div>
      </section>
    </main>
  )
}
