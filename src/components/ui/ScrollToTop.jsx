import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const ScrollToTop = () => {
    const { pathname } = usePathname();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

export default ScrollToTop;
