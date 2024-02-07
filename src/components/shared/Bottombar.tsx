import { bottombarLinks } from "@/constants";
import { INavLink} from "@/types";
import { Link, NavLink, useLocation } from "react-router-dom";

const Bottombar = () => {
  const {pathname} = useLocation();
  return (
    <section className="bottom-bar">
    {bottombarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;
            return (
              
                <NavLink to={link.route} key={link.label} className={` ${isActive && 'bg-primary-500 rounder-[10px] flex-center flex-col gap-1 p-2 transition'}`}>
                  <img src={link.imgURL} alt={link.label} className={`group-hover:invert-white ${isActive && 'invert-white'}`} width={16} height={16} />
                 <p className="tiny-medium text-light-2">{link.label}</p>
                </NavLink>

            )
          })}

    </section>
  )
}

export default Bottombar