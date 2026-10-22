import React from 'react';

export default function Link({
  href,
  children,
  className,
  onClick,
  target,
  rel,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  [key: string]: any;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      target={target}
      rel={rel}
      {...props}
    >
      {children}
    </a>
  );
}
