<template>
  <form class="contact-form" @submit.prevent="submitForm">
    <h2>Add Contact</h2>

    <div class="form-group">
      <label for="name">Name *</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        maxlength="255"
        required
        placeholder="Enter name"
      />
    </div>

    <div class="form-group">
      <label for="phone">Phone Number *</label>
      <input
        id="phone"
        v-model="form.phone_number"
        type="tel"
        required
        placeholder="+919876543210"
      />
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        placeholder="example@email.com"
      />
    </div>

    <div class="form-group">
      <label for="address">Address</label>
      <textarea
        id="address"
        v-model="form.address"
        rows="3"
        placeholder="Enter address"
      ></textarea>
    </div>

    <p v-if="error" class="form-error">
      {{ error }}
    </p>

    <button type="submit" :disabled="submitting">
      {{ submitting ? "Adding..." : "Add Contact" }}
    </button>
  </form>
</template>

<script setup>
import { reactive, ref } from "vue";
import api from "../services/api";

const emit = defineEmits(["contact-created"]);

const form = reactive({
  name: "",
  phone_number: "",
  email: "",
  address: "",
});

const error = ref("");
const submitting = ref(false);

const validatePhone = (phone) => {
  const pattern = /^\+?[1-9]\d{6,19}$/;
  return pattern.test(phone);
};

const submitForm = async () => {
  error.value = "";

  if (!form.name.trim()) {
    error.value = "Name is required.";
    return;
  }

  if (!validatePhone(form.phone_number)) {
    error.value =
      "Phone number must contain 7-20 digits and may start with +.";
    return;
  }

  submitting.value = true;

  try {
    const response = await api.post("/contacts", {
      name: form.name.trim(),
      phone_number: form.phone_number,
      email: form.email || null,
      address: form.address || null,
    });

    emit("contact-created", response.data);

    form.name = "";
    form.phone_number = "";
    form.email = "";
    form.address = "";
  } catch (err) {
    if (err.response?.status === 500) {
      error.value =
        "Unable to create contact. The phone number or email may already exist.";
    } else {
      error.value = "Unable to create contact.";
    }

    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>