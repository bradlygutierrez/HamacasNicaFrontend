import Link from "next/link";

interface SideBarButtonProps {
    photo: string;
    alt: string;
    hrefString: string;
    onClick?: () => void;
}


function sideBarButton({ photo, alt, hrefString, onClick }: SideBarButtonProps) {
    return (
        <button
            onClick={onClick}
            className="p-2 rounded-full hover:bg-[var(--color-foreground)] transition-colors duration-300 group text-[var(--color-foreground)] hover:text-[var(--color-foreground-secondary)]"
            aria-label={alt}
        >
            <Link href={hrefString}>
                <span
                    className="w-8 h-8 inline-block"
                    style={{
                        WebkitMaskImage: `url(${photo})`,
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskSize: 'contain',
                        WebkitMaskPosition: 'center',
                        maskImage: `url(${photo})`,
                        maskRepeat: 'no-repeat',
                        maskSize: 'cover',
                        maskPosition: 'center',
                        backgroundColor: 'currentColor',
                    }}
                    aria-hidden="true"
                />

            </Link>

        </button>
    );
}

export { sideBarButton }