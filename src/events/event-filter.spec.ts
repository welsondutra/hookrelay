import { matchesEventType } from './event-filter.js';

describe('matchesEventType', () => {
  it('subscribes to everything when the list is empty', () => {
    expect(matchesEventType([], 'order.created')).toBe(true);
  });

  it('matches exact names only', () => {
    expect(matchesEventType(['order.created'], 'order.created')).toBe(true);
    expect(matchesEventType(['order.created'], 'order.updated')).toBe(false);
    expect(matchesEventType(['order.created'], 'order.created.v2')).toBe(false);
  });

  it('matches a namespace wildcard', () => {
    expect(matchesEventType(['order.*'], 'order.created')).toBe(true);
    expect(matchesEventType(['order.*'], 'order.item.added')).toBe(true);
    expect(matchesEventType(['order.*'], 'orders.created')).toBe(false);
    expect(matchesEventType(['order.*'], 'order')).toBe(false);
  });

  it('matches everything with a bare wildcard', () => {
    expect(matchesEventType(['*'], 'anything.at.all')).toBe(true);
  });

  it('matches when any pattern in the list does', () => {
    expect(matchesEventType(['invoice.paid', 'order.*'], 'order.shipped')).toBe(true);
    expect(matchesEventType(['invoice.paid', 'order.*'], 'user.created')).toBe(false);
  });
});
