interface SideBarButtonProps {
    photo: string;
    alt: string;
    onClick?: () => void;
}


function sideBarButton({ photo, alt, onClick }: SideBarButtonProps) {
    return (
        <button
            onClick={onClick}
            className="p-2 rounded-full hover:bg-[var(--color-foreground)] transition-colors duration-300 group text-[var(--color-foreground)] hover:text-[var(--color-foreground-secondary)]"
            aria-label={alt}
        >
            <span
                className="w-8 h-8 inline-block"
                style={{
                    WebkitMaskImage: `url(${photo})`,
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                    WebkitMaskPosition: 'center',
                    maskImage: `url(${photo})`,
                    maskRepeat: 'no-repeat',
                    maskSize: 'contain',
                    maskPosition: 'center',
                    backgroundColor: 'currentColor',
                }}
                aria-hidden="true"
            />
        </button>
    );
}

export { sideBarButton }