import Link from "next/link"
import Image from "next/image"
const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
        <Image src="/icons/logo.png" alt="Logo" width={24} height={24} />DevEvent</Link>
        <ul>
          <Link href="/Home">Home</Link>
          <Link href="/Home">Events</Link>
          <Link href="/">Create Event</Link>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
