# Sai Nilesh Steel — Handcrafted Sai Baba Palkhis

A full-stack web application for **Sai Nilesh Steel**, a business specializing exclusively in handcrafted Sai Baba Palkhis.

## 🙏 About

This is a premium digital showroom combining traditional Indian aesthetics with modern professional design. The entire application is focused exclusively on **Sai Baba Palkhis** — from traditional to custom designs.

## Tech Stack

- **Frontend:** React.js + Vite
- **Backend:** Node.js + Express.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **Storage:** Firebase Storage
- **Styling:** Custom CSS (Premium Indian Devotional Theme)

---

## 🔥 Step-by-Step Firebase Connection Guide

Connecting this application to your Firebase account takes about 5 minutes. Follow these simple steps:

### Step 1: Create a Project in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **"Add project"** (or **"Create a project"**).
3. Enter a project name (e.g. `sai-nilesh-steel`) and click **Continue**.
4. Disable or enable Google Analytics (optional) and click **Create project**.

---

### Step 2: Enable Firebase Services

#### A. Firebase Authentication (For Admin Login)
1. In the Firebase console left menu, click **Build** > **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab, choose **Email/Password**.
4. Enable the first toggle (**Email/Password**) and click **Save**.
5. Switch to the **Users** tab and click **Add user**:
   - **Email:** e.g. `admin@sainileshsteel.com`
   - **Password:** (choose a secure password, e.g. `admin123456`)
   - Click **Add user**. *(You will use this email/password to log in to `/admin`)*

#### B. Cloud Firestore (Database)
1. In the left menu, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your users (e.g., `asia-south1` for Mumbai, India).
4. Select **Start in production mode** (or test mode) and click **Create**.
5. Once created, go to the **Rules** tab, paste the rules from `firebase/firestore.rules`, and click **Publish**.

#### C. Firebase Storage (For Palkhi & Gallery Photos)
1. In the left menu, click **Build** > **Storage**.
2. Click **Get started**.
3. Accept the default security rules and location, then click **Done**.
4. Go to the **Rules** tab, paste the rules from `firebase/storage.rules`, and click **Publish**.

---

### Step 3: Connect Frontend (`client/.env`)

1. In the Firebase Console, click the ⚙️ **Gear icon** next to *Project Overview* (top-left) > **Project settings**.
2. In the **General** tab, scroll down to **"Your apps"** and click the **Web icon** (`</>`).
3. Enter an App nickname (e.g. `Sai Nilesh Web`) and click **Register app**.
4. Firebase will display your `firebaseConfig` object with:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
5. Open `client/.env` in this project and replace the placeholder values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:...
```

---

### Step 4: Connect Backend (`server/`)

To allow the Node.js Express backend to communicate with Firestore:

1. In Firebase Console > **Project settings** (⚙️ gear icon), click on the **Service accounts** tab.
2. Ensure **Firebase Admin SDK** is selected (Node.js).
3. Click the blue button: **"Generate new private key"**, then confirm **Generate key**.
4. A JSON file will download to your computer (named something like `sai-nilesh-steel-firebase-adminsdk-xxxxx.json`).
5. **Rename that file to `serviceAccountKey.json`** and place it directly inside the `server/` directory:
   ```
   d:\PALKHI\server\serviceAccountKey.json
   ```
6. In `server/.env`, ensure `FIREBASE_STORAGE_BUCKET` matches your storage bucket:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   ```

---

### Step 5: Seed the Handcrafted Sai Baba Palkhi Data

Once you have placed `serviceAccountKey.json` in `server/`, run this one command in your terminal:

```bash
cd server
npm run seed
```

This will automatically create and populate your live Firestore database with:
- ✅ 8 Handcrafted Sai Baba Palkhi models with specifications and images
- ✅ 6 Categories (Traditional Silver, Royal Gold & Brass, SS 304, etc.)
- ✅ 8 Gallery photographs
- ✅ Customer inquiries & custom request templates
- ✅ Complete business settings (Nilesh Patil, Shirdi workshop, contact details)

---

### Step 6: Verify Connection

1. Refresh your browser at `http://localhost:5173/admin`.
2. Notice the badge in the admin header switches from:
   - `Dev Mode (Local Store)` ➡️ **`Live Firebase`** (with green shield).
3. Log in with the email & password you created in Step 2A.
4. Any Palkhi, image, or setting you edit in `/admin` will now save straight into your live Google Firebase Firestore and Cloud Storage!

---

## Running Locally

```bash
# Terminal 1 - Frontend
cd client
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:5000/api
- **Admin Panel:** http://localhost:5173/admin
