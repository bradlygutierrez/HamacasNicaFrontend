import Image from "next/image";

export default function Home() {
  return (
    <div className="flex w-full flex-col h-full p-0 justify-center font-sans min-h-screen flex items-center justify-center 
            bg-gradient-to-b from-[var(--color-buttons)] to-[var(--color-background)] text-[var(--color-foreground)">

      <section className="w-full p-0 flex justify-center ">
        <div className="bg-[url('/Logo.svg')]  bg-center bg-cover bg-no-repeat w-[50%] h-[29vh]">
        
        </div>
      </section>

        <section className="flex justify-center mt-9 mb-19 w-full h-[80vh]">
          <form className="flex flex-col p-10 items-center gap-10 bg-[var(--color-foreground-secondary)] h-[80%]  w-[40%] rounded-md shadow-2xl ">
            <h1 className="text-[var(--color-foreground)] text-6xl font-bold font-poppins mb-10">Iniciar sesión</h1>
            <input type="text" name="" id="" placeholder="usuario" className="placeholder-[var(--color-foreground)] h-14 w-[70%] bg-white shadow-md rounded-md p-5 text-center text-2xl font-semibold"/>
            <input type="password" name="" id="" placeholder="contraseña" className="h-14 w-[70%] placeholder-[var(--color-foreground)] bg-white shadow-md rounded-md p-5 text-center text-2xl font-semibold"/>
            <button className="text-center flex pb-1 justify-center items-center text-3xl font-bold text-[var(--color-foreground-secondary)] bg-[var(--color-buttons)] rounded-full w-[40%] shadow-md w-[30%] h-14 hover:bg-[var(--color-buttons-secondary)] transition-colors duration-300">
              Entrar
            </button>
          </form>
        </section>  

      
    </div>
  );
}
