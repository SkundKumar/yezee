CREATE TABLE cart_item_notes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    cart_item_id BIGINT REFERENCES cart_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_item_id)
);