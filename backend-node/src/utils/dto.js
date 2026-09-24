function userDto(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    google_id: user.google_id ?? null,
    created_at: user.created_at
  };
}

function contactDto(contact) {
  return {
    id: contact.id,
    name: contact.name,
    phone_number: contact.phone_number,
    email: contact.email ?? null,
    address: contact.address ?? null,
    category: contact.category,
    created_at: contact.created_at
  };
}

module.exports = { userDto, contactDto };
