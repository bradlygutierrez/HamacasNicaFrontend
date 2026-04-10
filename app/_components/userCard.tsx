import { Pencil } from "lucide-react";

interface UserCardProps {
    username: string;
    imgUrl: string;
}

export default function UserCard({ username, imgUrl }: UserCardProps) {
    return (
        <div className="flex flex-col mt-[5rem] w-[23vw] rounded-lg h-[44vh] bg-[var(--color-background-secondary)] overflow-visible shadow-xl">
            <div className="relative my-auto mx-auto w-[12rem] h-[12rem] rounded-[80%] bg-[var(--color-foreground)] shadow-xl">
                <img
                    src={imgUrl}
                    className="w-full h-full object-cover rounded-[80%]"
                />
            </div>
            <div className="w-[inherit] h-10 flex flex-row px-6 items-center justify-end">
                <Pencil
                    className="h-8 w-8 text-[var(--color-foreground)] cursor-pointer"
                    aria-hidden="true"
                />
            </div>
            <div className="w-[inherit] h-10 flex flex-row py-5 items-center justify-center">
                <h1 className="text-[2.4rem]">{username}</h1>
            </div>

        </div>
    );
}  