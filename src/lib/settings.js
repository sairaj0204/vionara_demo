export const DEFAULT_THEME = {
  primaryColor: '#C9A14A',
  bgColor: '#FFFFFF',
  textColor: '#121212',
  secondaryColor: '#999999',
};

export const DEFAULT_NEW_ARRIVALS_BANNER = {
  image: '/hero-premium.png',
  title: 'New Arrivals',
  subtitle: 'Discover the latest additions to the Vionara collection.',
};

export const DEFAULT_SETTINGS = {
  homeSections: {
    newArrivals: true,
    bestSeller: true,
    trending: true,
    newArrivalsTitle: 'New Arrivals',
    bestSellerTitle: 'Bestsellers',
  },
  productBadges: [{ text: 'NEW', color: '#10B981', expiry: 30 }],
  globalOffers: {
    type: 'flat',
    value: '10',
    active: true,
    bannerText: 'Flat 10% OFF on all Gold Jewelry',
  },
  searchCMS: {
    trendingKeywords: 'gold rings, diamond necklaces, silver earrings',
    autoSuggest: true,
  },
  videoBanner: {
    url: '',
    autoplay: true,
    loop: true,
    fallbackImage: '',
  },
  mobileConfig: {
    hideBanners: false,
    simplifiedMenu: true,
    customMobileHero: false,
  },
  announcementTop: {
    isActive: true,
    speed: 3000,
    messages: [{ text: '50% OFF on Select Styles', coupon: 'EXTRA100' }],
    bgColor: '#000000',
    textColor: '#ffffff',
  },
  announcementBottom: {
    isActive: true,
    speed: 30,
    messages: [
      'Elegant Jewellery for Every Occasion',
      'Free Shipping Above ₹999',
      '5L+ Happy Customers',
    ],
  },
  reviewConfig: {
    autoApprove: false,
    requiresImage: false,
  },
  instagramGallery: {
    isActive: true,
    posts: [
      { imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', link: '' },
      { imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', link: '' },
      { imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', link: '' },
      { imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400', link: '' },
      { imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400', link: '' },
      { imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d569b610?w=400', link: '' },
    ],
  },
};

export const hasMongoConfig = () => Boolean(process.env.MONGODB_URI);
