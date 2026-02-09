class ElbotCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      this.content = document.createElement('div');
      this.content.style.cssText = `
        height: 120px;
        border-radius: 20px;
        padding: 24px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
      `;
      card.appendChild(this.content);
      this.appendChild(card);
      this.card = card;

      this.content.addEventListener('click', () => {
        const event = new Event('hass-more-info', { bubbles: true, composed: true });
        event.detail = { entityId: this.config.cheapest_entity || 'sensor.cheapest_upcoming_prices' };
        this.dispatchEvent(event);
      });
    }

    const entityId = this.config.entity;
    const cheapestEntityId = this.config.cheapest_entity || 'sensor.cheapest_upcoming_prices';
    const entity = hass.states[entityId];
    const cheapest = hass.states[cheapestEntityId];

    if (!entity) {
      this.content.innerHTML = `<p>Entity ${entityId} not found</p>`;
      return;
    }

    const state = entity.state;
    const price = entity.attributes.current_price || 0;
    const p6h = cheapest?.attributes?.next_6h_price || 0;
    const t6h = cheapest?.attributes?.next_6h_time || '';

    let background, icon;
    switch (state) {
      case 'Perfect':
        background = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)';
        icon = 'mdi:emoticon-excited';
        break;
      case 'Good':
        background = 'linear-gradient(135deg, #8BC34A 0%, #558B2F 100%)';
        icon = 'mdi:emoticon-happy';
        break;
      case 'Caution':
        background = 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)';
        icon = 'mdi:emoticon-neutral';
        break;
      case 'Bad':
        background = 'linear-gradient(135deg, #B71C1C 0%, #880E4F 100%)';
        icon = 'mdi:emoticon-sad';
        break;
      default:
        background = 'linear-gradient(135deg, #9E9E9E 0%, #616161 100%)';
        icon = 'mdi:emoticon-confused';
    }

    const isCompact = !!this.config.compact;
    const radius = isCompact ? '12px' : '20px';

    this.content.style.background = background;
    this.content.style.height = isCompact ? '60px' : '120px';
    this.content.style.padding = isCompact ? '12px' : '24px';
    this.content.style.borderRadius = radius;
    if (this.card) {
      this.card.style.padding = '0';
      this.card.style.background = 'transparent';
      this.card.style.boxShadow = 'none';
      this.card.style.setProperty('--ha-card-background', 'transparent');
      this.card.style.setProperty('--ha-card-border-width', '0');
      this.card.style.setProperty('--ha-card-box-shadow', 'none');
      this.card.style.setProperty('--ha-card-border-radius', radius);
      this.card.style.borderRadius = radius;
      this.card.style.overflow = 'hidden';
    }

    this.content.innerHTML = `
      <div style="position: absolute; right: ${isCompact ? '-40px' : '-60px'}; top: 50%; transform: translateY(-50%); opacity: 0.15; z-index: 1;">
        <ha-icon icon="${icon}" style="width: ${isCompact ? '150px' : '250px'}; height: ${isCompact ? '150px' : '250px'}; color: white; --mdc-icon-size: ${isCompact ? '150px' : '250px'};"></ha-icon>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-start; z-index: 2; position: relative;">
        <div style="color: white; font-size: ${isCompact ? '12px' : '16px'}; line-height: 1.2;">
          Electricity Status<br>
          <span style="font-size: ${isCompact ? '20px' : '32px'}; font-weight: 900; letter-spacing: 2px;">${state.toUpperCase()}</span>
        </div>
        <div style="color: white; font-size: ${isCompact ? '16px' : '24px'}; font-weight: 600;">
          ${parseFloat(price).toFixed(2)}<span style="font-size: ${isCompact ? '10px' : '15px'};">/kWh</span>
        </div>
      </div>

      <div style="color: white; font-size: ${isCompact ? '10px' : '12px'}; opacity: 0.85; font-weight: 600; z-index: 2; position: relative;">
        Cheapest: ${parseFloat(p6h).toFixed(2)} DKK at ${t6h}
      </div>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  getCardSize() {
    return this.config?.compact ? 1 : 2;
  }

  static getConfigElement() {
    return document.createElement("elbot-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "sensor.elbot_recommendation_status",
      cheapest_entity: "sensor.cheapest_upcoming_prices",
      compact: false
    };
  }
}

// Visual Editor
class ElbotCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    if (!this.content) {
      this.innerHTML = `
        <div style="padding: 16px;">
          <h3 style="margin-top: 0;">Elbot Card Configuration</h3>

          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">
              Recommendation Entity (Required)
            </label>
            <input
              type="text"
              class="entity-input"
              .value="${config.entity || ''}"
              placeholder="sensor.elbot_recommendation_status"
              style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
            />
            <small style="color: #666; display: block; margin-top: 4px;">
              Entity that provides the electricity recommendation status
            </small>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">
              Cheapest Price Entity (Optional)
            </label>
            <input
              type="text"
              class="cheapest-entity-input"
              .value="${config.cheapest_entity || 'sensor.cheapest_upcoming_prices'}"
              placeholder="sensor.cheapest_upcoming_prices"
              style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
            />
            <small style="color: #666; display: block; margin-top: 4px;">
              Entity that provides the cheapest upcoming price information
            </small>
          </div>

          <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <input
              type="checkbox"
              class="compact-input"
              ${config.compact ? 'checked' : ''}
            />
            <label style="font-weight: 500;">
              Compact card (half height)
            </label>
          </div>
        </div>
      `;

      this.content = true;

      // Add event listeners
      this.querySelector('.entity-input').addEventListener('input', (e) => {
        this._config = { ...this._config, entity: e.target.value };
        this.configChanged();
      });

      this.querySelector('.cheapest-entity-input').addEventListener('input', (e) => {
        this._config = { ...this._config, cheapest_entity: e.target.value };
        this.configChanged();
      });

      this.querySelector('.compact-input').addEventListener('change', (e) => {
        this._config = { ...this._config, compact: e.target.checked };
        this.configChanged();
      });
    }
  }

  configChanged() {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }
}

customElements.define('elbot-card', ElbotCard);
customElements.define('elbot-card-editor', ElbotCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'elbot-card',
  name: 'Elbot Card',
  description: 'Custom electricity recommendation card',
  preview: false,
});

console.info(
  `%c ELBOT-CARD %c v${window.elbotCardVersion || 'dev'} `,
  'color: white; background: #FFC107; font-weight: 700;',
  'color: #FFC107; background: black; font-weight: 700;'
);