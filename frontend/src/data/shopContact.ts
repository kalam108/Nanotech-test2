/**
 * NanoTech Itahari - Shop Owner Official Contact
 * Phone & WhatsApp: 9852055346 (+977 9852055346)
 */

export const SHOP_OWNER_PHONE = '9852055346';
export const SHOP_OWNER_FULL_PHONE = '9779852055346';
export const SHOP_OWNER_DISPLAY_PHONE = '+977 9852055346';
export const SHOP_OWNER_NAME = 'NanoTech Solution (Shop Owner)';
export const SHOP_LOCATION = 'Itahari-6, National Galli, Sunsari, Nepal';

/**
 * Universal helper to build direct WhatsApp link to shop owner
 */
export function getShopOwnerWhatsAppUrl(customMessage?: string): string {
  const defaultMsg = 'Hi! I am interested in purchasing hardware products from NanoTech Itahari.';
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${SHOP_OWNER_FULL_PHONE}?text=${text}`;
}

/**
 * Helper to build product inquiry WhatsApp link directly to shop owner
 */
export function getProductWhatsAppUrl(product: {
  title: string;
  price?: number;
  sellerName?: string;
}): string {
  const priceText = product.price ? ` (NPR ${product.price.toLocaleString()})` : '';
  const text = encodeURIComponent(
    `Hi NanoTech Shop Owner, I am interested in "${product.title}"${priceText}. Is it available in stock in Itahari right now?`
  );
  return `https://wa.me/${SHOP_OWNER_FULL_PHONE}?text=${text}`;
}
