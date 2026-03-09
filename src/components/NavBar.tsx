import Link from "next/link";
import { AuthStatus } from "./AuthStatus";

export function NavBar() {
    return (
        <nav className = "navbar">
            <div className = "navleft">
                <Link href = "/">Home</Link>
                <Link href = "/missions">Missions</Link>
            </div>
            <div className = "navright">
                <Link href = "/report">Report Issue</Link>
                <AuthStatus />
            </div>
        </nav>
    )
}