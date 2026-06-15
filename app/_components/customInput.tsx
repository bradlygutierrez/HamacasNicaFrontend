import { Lock, User, Mail } from "lucide-react";

interface customInputProps {
    customPlaceholder: string;
    type: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CustomInput({ customPlaceholder, type = "text", name, value, onChange }: customInputProps) {
    const Icon = type === "password" ? Lock : type === "email" ? Mail : User;

    return (
        <div className="relative flex w-full flex-col">
            <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-foreground-secondary)]" aria-hidden="true" />
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={customPlaceholder}
                className="w-full rounded-lg bg-[var(--color-foreground)] py-3 pl-12 pr-4 text-left text-lg font-medium text-[var(--color-foreground-secondary)] placeholder:text-[var(--color-foreground-secondary)]/70"
            />
        </div>
    )
}
