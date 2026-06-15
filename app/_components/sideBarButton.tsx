interface SideBarButtonProps {
    photo: string;
    alt: string;
    hrefString?: string;
    onClick?: () => void;
}


function sideBarButton({ photo, alt, hrefString, onClick }: SideBarButtonProps) {
    const icon = (
        <span
            className="h-6 w-6 inline-block"
            style={{
                WebkitMaskImage: `url(${photo})`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                WebkitMaskPosition: "center",
                maskImage: `url(${photo})`,
                maskRepeat: "no-repeat",
                maskSize: "contain",
                maskPosition: "center",
                backgroundColor: "currentColor",
            }}
            aria-hidden="true"
        />
    );

    if (!hrefString || hrefString === "#") {
        return (
            <button
                type="button"
                onClick={onClick}
                className="p-2 rounded-full hover:bg-[var(--color-foreground)] transition-colors duration-300 text-[var(--color-foreground)] hover:text-[var(--color-foreground-secondary)]"
                aria-label={alt}
            >
                {icon}
            </button>
        );
    }

    return (
        <a
            href={hrefString}
            onClick={onClick}
            className="p-2 rounded-full hover:bg-[var(--color-foreground)] transition-colors duration-300 text-[var(--color-foreground)] hover:text-[var(--color-foreground-secondary)]"
            aria-label={alt}
        >
            {icon}
        </a>
    );
}

export { sideBarButton }
