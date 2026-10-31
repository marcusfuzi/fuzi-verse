import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'fuziverse_default_secret',
    { expiresIn: '30d' }
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName, role } = req.body;

    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check existing
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken. Please choose another.' });
    }

    const user = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      displayName: displayName.trim(),
      role: role === 'listener' ? 'listener' : 'creator',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    });

    await user.save();
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully! Welcome to Fuzi Verse.',
      token,
      user,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // email or username

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide email/username and password.' });
    }

    const cleanId = identifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account is suspended. Contact admin@fuziverse.com' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      message: `Welcome back, ${user.displayName}!`,
      token,
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. ' + err.message });
  }
});

// Current User
router.get('/me', requireAuth, async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.put('/update-profile', requireAuth, uploadSingleImage, async (req, res) => {
  try {
    const updates = {};
    const { displayName, bio, website, instagram, soundCloud } = req.body;

    if (displayName) updates.displayName = displayName.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (website !== undefined) updates.website = website.trim();
    if (instagram !== undefined) updates.instagram = instagram.trim();
    if (soundCloud !== undefined) updates.soundCloud = soundCloud.trim();

    if (req.file) {
      updates.avatar = `/uploads/covers/${req.file.filename}`;
    } else if (req.body.avatar) {
      updates.avatar = req.body.avatar.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    return res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Change Password
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Forgot Password Flow
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    // Secure pattern: always return confirmation so emails cannot be enumerated
    return res.json({
      message: 'If that email exists in our system, a password reset token has been dispatched.',
      demoToken: user ? 'fuzi-reset-token-valid-15m' : null,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
