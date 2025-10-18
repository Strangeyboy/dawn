/**
 * Currency Converter for Shopify Store
 * Base Currency: GBP
 * Supported Currencies: AED, AUD, CNY, EUR, GBP, JPY, NZD, USD
 */

class CurrencyConverter {
  constructor() {
    this.baseCurrency = 'GBP';
    this.supportedCurrencies = ['AED', 'AUD', 'CNY', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'];
    this.currentCurrency = this.baseCurrency;
    this.exchangeRates = null;
    this.cacheKey = 'innerpace_exchange_rates';
    this.cacheDuration = 3600000; // 1 hour in milliseconds
    this.detectionCacheKey = 'innerpace_detected_country';
    this.detectionCacheDuration = 86400000; // 24 hours in milliseconds
    this.currencySymbols = {
      AED: 'د.إ',
      AUD: 'A$',
      CNY: '¥',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      NZD: 'NZ$',
      USD: '$',
    };
    this.decimalPlaces = {
      JPY: 0, // Japanese Yen doesn't use decimal places
      default: 2,
    };
    // Country code to currency mapping
    this.countryToCurrency = {
      AE: 'AED',
      AU: 'AUD',
      NZ: 'NZD',
      GB: 'GBP',
      CN: 'CNY',
      JP: 'JPY',
      US: 'USD',
      // European countries
      AT: 'EUR',
      BE: 'EUR',
      CY: 'EUR',
      EE: 'EUR',
      FI: 'EUR',
      FR: 'EUR',
      DE: 'EUR',
      GR: 'EUR',
      IE: 'EUR',
      IT: 'EUR',
      LV: 'EUR',
      LT: 'EUR',
      LU: 'EUR',
      MT: 'EUR',
      NL: 'EUR',
      PT: 'EUR',
      SK: 'EUR',
      SI: 'EUR',
      ES: 'EUR',
    };
  }

  /**
   * Initialize the currency converter
   */
  async init() {
    try {
      // Load exchange rates first
      const ratesLoaded = await this.loadExchangeRates();

      // If no rates available, hide currency selector and stop
      if (!ratesLoaded || !this.exchangeRates) {
        this.hideCurrencySelector();
        return;
      }

      // Show currency selector since we have rates
      this.showCurrencySelector();

      // Load saved currency preference or detect
      const savedCurrency = this.getSavedCurrency();
      if (savedCurrency) {
        this.currentCurrency = savedCurrency;
      } else {
        this.currentCurrency = await this.detectCurrency();
      }

      // Clear any stale data attributes from previous conversions
      document.querySelectorAll('[data-converted="true"]').forEach((el) => {
        delete el.dataset.converted;
        delete el.dataset.convertedCurrency;
      });

      // Update dropdown to show correct currency BEFORE converting prices
      this.updateCurrencySelector();

      // Convert all prices on page
      this.convertAllPrices();

      // Setup event listeners
      this.setupEventListeners();

      // Force update dropdown after a delay to catch any theme re-renders
      this.forceUpdateCurrencySelector();
    } catch (error) {
      this.hideCurrencySelector();
    }
  }

  /**
   * Detect currency using multiple methods with caching
   */
  async detectCurrency() {
    // 1. Check cached detection (24 hour cache)
    const cachedDetection = this.getCachedDetection();
    if (cachedDetection) {
      return this.countryToCurrency[cachedDetection] || this.baseCurrency;
    }

    // 2. Try geolocation API (most accurate)
    try {
      const countryCode = await this.detectCountryFromIP();
      if (countryCode) {
        this.saveCachedDetection(countryCode);
        return this.countryToCurrency[countryCode] || this.baseCurrency;
      }
    } catch (error) {
      // Silent fallback to browser locale
    }

    // 3. Fallback to browser locale
    return this.detectCurrencyFromBrowserLocale();
  }

  /**
   * Detect country from IP using a free geolocation API
   */
  async detectCountryFromIP() {
    try {
      // Using ipapi.co - free tier allows 1,000 requests/day
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Geolocation API failed');
      }

      const data = await response.json();
      return data.country_code;
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect currency from browser locale (fallback method)
   */
  detectCurrencyFromBrowserLocale() {
    try {
      const locale = navigator.language || navigator.userLanguage;
      const currencyMap = {
        'en-US': 'USD',
        'en-AU': 'AUD',
        'en-NZ': 'NZD',
        'en-GB': 'GBP',
        de: 'EUR',
        fr: 'EUR',
        es: 'EUR',
        it: 'EUR',
        nl: 'EUR',
        zh: 'CNY',
        'zh-CN': 'CNY',
        ja: 'JPY',
        'ar-AE': 'AED',
      };

      // Try exact match first
      if (currencyMap[locale]) {
        return currencyMap[locale];
      }

      // Try language code only
      const lang = locale.split('-')[0];
      if (currencyMap[lang]) {
        return currencyMap[lang];
      }

      // Extract country code from locale (e.g., en-US → US)
      const parts = locale.split('-');
      if (parts.length > 1) {
        const countryCode = parts[1].toUpperCase();
        if (this.countryToCurrency[countryCode]) {
          return this.countryToCurrency[countryCode];
        }
      }

      // Default to GBP
      return this.baseCurrency;
    } catch (error) {
      return this.baseCurrency;
    }
  }

  /**
   * Get cached country detection
   */
  getCachedDetection() {
    try {
      const cached = localStorage.getItem(this.detectionCacheKey);
      if (!cached) return null;

      const { countryCode, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (24 hours)
      if (now - timestamp < this.detectionCacheDuration) {
        return countryCode;
      }

      // Cache expired
      localStorage.removeItem(this.detectionCacheKey);
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save detected country to cache
   */
  saveCachedDetection(countryCode) {
    try {
      const cacheData = {
        countryCode: countryCode,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.detectionCacheKey, JSON.stringify(cacheData));
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Get saved currency from localStorage
   */
  getSavedCurrency() {
    try {
      return localStorage.getItem('selected_currency');
    } catch (error) {
      return null;
    }
  }

  /**
   * Save currency preference to localStorage
   */
  saveCurrency(currency) {
    try {
      localStorage.setItem('selected_currency', currency);
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Load exchange rates from cache or API
   * Returns true if rates loaded successfully, false otherwise
   */
  async loadExchangeRates() {
    // Try to load from cache first
    const cachedData = this.getFromCache();
    if (cachedData) {
      this.exchangeRates = cachedData;
      return true;
    }

    // Fetch from API
    return await this.fetchExchangeRates();
  }

  /**
   * Get exchange rates from localStorage cache
   */
  getFromCache() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const { rates, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < this.cacheDuration) {
        return rates;
      }

      // Cache expired
      localStorage.removeItem(this.cacheKey);
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save exchange rates to cache
   */
  saveToCache(rates) {
    try {
      const cacheData = {
        rates: rates,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Fetch exchange rates from ExchangeRate-API.com (free tier, supports ALL currencies including AED)
   * Returns true if successful, false if API fails
   */
  async fetchExchangeRates() {
    try {
      // ExchangeRate-API.com - free tier, no API key required, supports ALL currencies
      // Free tier: 1,500 requests/month
      const response = await fetch(`https://open.er-api.com/v6/latest/${this.baseCurrency}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();

      if (data.result === 'success' && data.rates) {
        this.exchangeRates = data.rates;
        this.saveToCache(data.rates);
        return true;
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Hide currency selector if rates unavailable
   */
  hideCurrencySelector() {
    const selectors = document.querySelectorAll('.currency-selector-wrapper');
    selectors.forEach((wrapper) => {
      wrapper.style.display = 'none';
    });
  }

  /**
   * Show currency selector when rates are available
   */
  showCurrencySelector() {
    const selectors = document.querySelectorAll('.currency-selector-wrapper');
    selectors.forEach((wrapper) => {
      wrapper.style.display = '';
    });
  }

  /**
   * Convert amount from base currency to target currency
   */
  convert(amount, targetCurrency = this.currentCurrency) {
    if (!this.exchangeRates) {
      return amount;
    }

    if (targetCurrency === this.baseCurrency) {
      return amount;
    }

    const rate = this.exchangeRates[targetCurrency];
    if (!rate) {
      return amount; // No conversion if rate not available
    }

    return amount * rate;
  }

  /**
   * Format price with currency symbol
   */
  formatPrice(amount, currency = this.currentCurrency) {
    const symbol = this.currencySymbols[currency] || currency;
    const decimals = this.decimalPlaces[currency] || this.decimalPlaces['default'];

    const formattedAmount = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Different formatting for different currencies
    if (currency === 'EUR') {
      return `${formattedAmount}${symbol}`;
    } else {
      return `${symbol}${formattedAmount}`;
    }
  }

  /**
   * Parse price from text (removes currency symbols and converts to number)
   */
  parsePrice(priceText) {
    if (typeof priceText === 'number') {
      return priceText;
    }

    // Get text content if it's a node
    const text = (priceText.textContent || priceText.toString()).trim();

    // Remove all currency symbols and letters, but KEEP numbers, dots, and commas
    // Note: Don't include \. in character class - we need to keep dots!
    let cleaned = text.replace(/[£$€¥دإA-Za-z\s]/g, '');

    // Count occurrences of separators
    const dotCount = (cleaned.match(/\./g) || []).length;
    const commaCount = (cleaned.match(/,/g) || []).length;

    // Determine decimal separator based on position and count
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');

    // Calculate characters AFTER the separator (excluding the separator itself)
    const charsAfterDot = lastDot >= 0 ? cleaned.length - lastDot - 1 : -1;
    const charsAfterComma = lastComma >= 0 ? cleaned.length - lastComma - 1 : -1;

    if (commaCount === 0 && dotCount === 1) {
      // Single dot - check if it's decimal or thousands
      if (charsAfterDot <= 2) {
        // Dot is decimal: "28.08" (2 after), "123.5" (1 after)
        // Keep as is
      } else {
        // Dot is thousands: "1.234" (3 after) → "1234"
        cleaned = cleaned.replace(/\./g, '');
      }
    } else if (dotCount === 0 && commaCount === 1) {
      // Single comma - check if it's decimal or thousands
      if (charsAfterComma <= 2) {
        // Comma is decimal: "28,08" → "28.08"
        cleaned = cleaned.replace(',', '.');
      } else {
        // Comma is thousands: "1,234" → "1234"
        cleaned = cleaned.replace(',', '');
      }
    } else if (lastDot > lastComma) {
      // Dot comes after comma: "1,234.56"
      cleaned = cleaned.replace(/,/g, '');
    } else if (lastComma > lastDot) {
      // Comma comes after dot: "1.234,56"
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Multiple separators of same type or no separators
      cleaned = cleaned.replace(/[,.]/g, '');
    }

    cleaned = cleaned.replace(/[^\d.]/g, '');

    const parsed = parseFloat(cleaned);

    if (isNaN(parsed) || parsed === 0) {
      return 0;
    }

    return parsed;
  }

  /**
   * Convert all visible prices on the page
   */
  convertAllPrices() {
    // Find all price elements - expanded to include cart drawer and cart page
    const priceElements = document.querySelectorAll(
      '.price-item, .cart-item__old-price, .cart-item__final-price, .totals__total-value, .product-option, .price--end'
    );

    priceElements.forEach((element) => {
      this.convertPriceElement(element);
    });

    // Update currency selector if it exists
    this.updateCurrencySelector();
  }

  /**
   * Convert a single price element
   */
  convertPriceElement(element) {
    // Get original price - ALWAYS use stored original if available
    let originalPrice;

    if (element.dataset.originalPrice && element.dataset.originalPrice !== 'undefined') {
      // Use stored original price
      originalPrice = parseFloat(element.dataset.originalPrice);
    } else {
      // First time seeing this element - parse and store original
      const originalText = element.textContent.trim();

      if (!originalText || originalText === '') {
        return;
      }

      originalPrice = this.parsePrice(originalText);

      if (isNaN(originalPrice) || originalPrice === 0) {
        return;
      }

      // Store the NUMERIC value (not the formatted text)
      element.dataset.originalPrice = originalPrice;
      element.dataset.originalText = originalText;
    }

    // Skip if already converted to current currency
    if (element.dataset.converted === 'true' && element.dataset.convertedCurrency === this.currentCurrency) {
      return;
    }

    // Convert price from base currency
    const convertedPrice = this.convert(originalPrice);
    const formattedPrice = this.formatPrice(convertedPrice);

    // Update element
    element.textContent = formattedPrice;
    element.dataset.converted = 'true';
    element.dataset.convertedCurrency = this.currentCurrency;
  }

  /**
   * Change currency and reconvert all prices
   */
  async changeCurrency(newCurrency) {
    if (!this.supportedCurrencies.includes(newCurrency)) {
      return;
    }

    this.currentCurrency = newCurrency;
    this.saveCurrency(newCurrency);

    // Reset all converted flags
    const priceElements = document.querySelectorAll('[data-converted="true"]');
    priceElements.forEach((element) => {
      element.dataset.converted = 'false';
    });

    // Reconvert all prices
    this.convertAllPrices();

    // Update all dropdowns to match (with force to ensure it sticks)
    this.forceUpdateCurrencySelector();

    // Trigger custom event for other components
    window.dispatchEvent(
      new CustomEvent('currency:changed', {
        detail: { currency: newCurrency },
      })
    );
  }

  /**
   * Update currency selector dropdown
   */
  updateCurrencySelector() {
    // Update all currency selectors on the page (desktop + mobile)
    const selectors = document.querySelectorAll('.currency-selector');

    selectors.forEach((selector) => {
      if (selector.value !== this.currentCurrency) {
        // Mark this as a programmatic update
        selector.dataset.updatingProgrammatically = 'true';
        selector.value = this.currentCurrency;

        // Remove flag after a brief moment
        setTimeout(() => {
          delete selector.dataset.updatingProgrammatically;
        }, 50);
      }
    });
  }

  /**
   * Force update currency selector (with retries for race conditions)
   */
  forceUpdateCurrencySelector() {
    // Immediate update
    this.updateCurrencySelector();

    // Delayed updates to catch any re-renders by theme scripts
    setTimeout(() => this.updateCurrencySelector(), 100);
    setTimeout(() => this.updateCurrencySelector(), 500);
    setTimeout(() => this.updateCurrencySelector(), 1000);
    setTimeout(() => this.updateCurrencySelector(), 2000);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Currency selector change - handle multiple selectors (desktop + mobile)
    const selectors = document.querySelectorAll('.currency-selector');
    selectors.forEach((selector) => {
      selector.addEventListener('change', (e) => {
        // Skip if this is our programmatic update
        if (e.target.dataset.updatingProgrammatically === 'true') {
          return;
        }

        const newCurrency = e.target.value;
        this.changeCurrency(newCurrency);
      });
    });

    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        // Clear converted flags for cart items to force fresh conversion
        document.querySelectorAll('.product-option, .price--end').forEach((el) => {
          delete el.dataset.converted;
        });
        this.convertAllPrices();
      }, 100);
    });

    // Listen for product variant changes
    document.addEventListener('variant:change', () => {
      setTimeout(() => {
        this.convertAllPrices();
      }, 100);
    });

    // Periodically check if dropdown needs fixing (last resort for aggressive themes)
    setInterval(() => {
      const selectors = document.querySelectorAll('.currency-selector');
      selectors.forEach((selector) => {
        if (selector.value !== this.currentCurrency && !selector.dataset.updatingProgrammatically) {
          this.updateCurrencySelector();
        }
      });
    }, 3000);

    // Observer for dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              const priceElements = node.querySelectorAll?.(
                '.price-item, .cart-item__old-price, .cart-item__final-price, .totals__total-value, .product-option, .price--end'
              );
              if (priceElements && priceElements.length > 0) {
                setTimeout(() => {
                  priceElements.forEach((el) => this.convertPriceElement(el));
                }, 50);
              }
            }
          });
        }
      });
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Get current currency
   */
  getCurrentCurrency() {
    return this.currentCurrency;
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency = this.currentCurrency) {
    return this.currencySymbols[currency] || currency;
  }
}

// Initialize currency converter when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.currencyConverter = new CurrencyConverter();
    window.currencyConverter.init();
  });
} else {
  window.currencyConverter = new CurrencyConverter();
  window.currencyConverter.init();
}
