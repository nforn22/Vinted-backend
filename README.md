## Technologies

- Node.js
- Express.js
- MongoDB avec Mongoose
- Cloudinary pour le stockage d'images
- express-fileupload pour gérer les uploads
- crypto-js et uid2 pour l'authentification

## Installation

- Cloner le dépôt
$ git clone https://github.com/<votre-utilisateur>/Vinted.git

$ cd Vinted

- Installer les dépendances
  $ npm install

## Configuration

- Créer un fichier .env à la racine avec les variables suivantes :
MONGODB_URI=mongodb://localhost:27017/auth-vinted
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

## Démarrage

$ npm run start

## Structure

├── index.js           # point d'entrée
├── routes/
│   ├── user.js        # routes d'authentification
│   └── offer.js       # routes des annonces
├── models/
│   ├── User.js
│   └── Offer.js
├── utils/
│   └── convertToBase64.js
├── middleware/
│   └── isAuthenticated.js
└── package.json
