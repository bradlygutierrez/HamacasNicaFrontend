import { Lock, User } from "lucide-react";

interface customInputProps {
    customPlaceholder: string;
    type?: string;
}

export default function CustomInput({ customPlaceholder, type = "text" }: customInputProps) {
    const Icon = type === "password" ? Lock : User;

    return (
        <div className="relative w-[70%]">
            <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-foreground-secondary)]" aria-hidden="true" />
            <input
                type={type}
                placeholder={customPlaceholder}
                className="w-full pl-12 pr-4 text-left bg-[var(--color-foreground)] text-[var(--color-foreground-secondary)] font-medium text-lg py-[0.7rem] rounded-lg"
            />
        </div>
    )
}