'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { pathToUrl } from '@/utils/menu';
import { getLocaleFromPath, defaultLocale } from '@/lib/i18n/getLocale';
import koMessages from '@/locales/ko.json';
import enMessages from '@/locales/en.json';

const translations = {
  ko: koMessages,
  en: enMessages,
} as const;

export default function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const translation = translations[locale] ?? translations[defaultLocale];
  const footerDescription = translation.footer?.description ?? translations.ko.footer.description;
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Product@signal', path: '/Product/Product@signal/Log Collecting' },
      { name: 'Docs@signal', path: '/Product/Docs@signal' },
      { name: 'Security & Privacy', path: '/Product/Security&Privacy' },
      { name: "What's New", path: "/Product/What's New" },
    ],
    solutions: [
      { name: 'By Team', path: '/Solutions/By Team/Product/Funnel' },
      { name: 'By Industry', path: '/Solutions/By Industry/eCommerce' },
      { name: 'By Size', path: '/Solutions/By Size/Enterprise' },
    ],
    resources: [
      { name: 'Docs@signal', path: '/Resources/Docs@signal/Onboarding guide' },
      { name: 'Customer Stories', path: '/Resources/Customers@signal' },
      { name: 'Blogs@signal', path: '/Resources/Blogs@signal' },
      { name: 'FAQ', path: '/Resources/FAQ' },
    ],
    company: [
      { name: 'About Nethru', path: '/Company/About us' },
      { name: 'Contact Sales', path: '/Pricing/Contact Sales' },
    ],
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-brand">
            <Link href={`/${locale}`} className="footer-logo">
              <img
                src="/images/logo.svg"
                alt="AtSignal"
                className="footer-logo-image"
              />
            </Link>
            <p className="footer-description">
              {footerDescription}
            </p>
          </div>

          {/* Links Grid */}
          <div className="footer-links">
            <div className="footer-column">
              <h3 className="footer-column-title">Product</h3>
              <ul className="footer-link-list">
                {footerLinks.product.map((link) => (
                  <li key={link.path}>
                    <Link href={pathToUrl(link.path, locale)} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-column-title">Solutions</h3>
              <ul className="footer-link-list">
                {footerLinks.solutions.map((link) => (
                  <li key={link.path}>
                    <Link href={pathToUrl(link.path, locale)} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-column-title">Resources</h3>
              <ul className="footer-link-list">
                {footerLinks.resources.map((link) => (
                  <li key={link.path}>
                    <Link href={pathToUrl(link.path, locale)} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-column-title">Company</h3>
              <ul className="footer-link-list">
                {footerLinks.company.map((link) => (
                  <li key={link.path}>
                    <Link href={pathToUrl(link.path, locale)} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>© {currentYear} Nethru. All rights reserved.</p>
          </div>
          <div className="footer-legal">
            <Link href={pathToUrl("/Product/Security&Privacy", locale)} className="footer-legal-link">
              Privacy Policy
            </Link>
            <span className="footer-separator">·</span>
            <Link href={pathToUrl("/Pricing/Contact Sales", locale)} className="footer-legal-link">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}



