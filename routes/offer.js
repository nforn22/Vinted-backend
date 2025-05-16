const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");


const Offer = require("../models/Offer");

const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../middleware/isAuthenticated");
const fileUpload = require("express-fileupload");

// publier une offre =========
router.post("/offer/publish", isAuthenticated, fileUpload(), async (req, res) => {
    try {
        const { title, description, price, condition, city, brand, size, color } = req.body;

        if (!req.files?.picture) {
            return res.status(400).json({ message: "Missing picture"});
        }

        if (title.length > 50 || description.length > 500 || price > 10000) {
            return res.status(400).json({ message: "Title/description/price exceeds allowed limits" })
        }

        const convertedPicture = convertToBase64(req.files.picture);
        const cloudinaryResponse = await cloudinary.uploader.upload(convertedPicture, {
            folder: `vinted/offers`
        });

        const newOffer = new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                { MARQUE: brand },
                { TAILLE: size },
                { ETAT: condition },
                { COULEUR: color },
                { EMPLACEMENT: city }
            ],
            product_image: cloudinaryResponse,
            owner: req.user
        })

        await newOffer.save();

        const movedImage = await cloudinary.uploader.upload(convertedPicture, {
            folder: `vinted/offers/${newOffer._id}`,
          });

        newOffer.product_image = movedImage; // met a jour l'img dans l'offre
        await newOffer.save()

        res.status(201).json(newOffer)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// modifier une offre =========
router.put("/offer/update/:id", isAuthenticated, async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) return res.status(404).json({ message: "Offer not found" });
        if (offer.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbiden" });
        }

        const { title, description, price } = req.body;
        if (title?.length > 50 || description?.length > 500 || price > 100000) {
            return res.status(400).json({ message: "Limits exceeded" });
        }

        if (title) offer.product_name = title
        if (description) offer.product_description = description
        if (price) offer.product_price = price;

        await offer.save();
        res.json(offer);

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

// supprimer une offre =========
router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) return res.status(401).json({ message: "Offer not found" }); 
        if (offer.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden" });
        } 

        await offer.deleteOne();
        res.json({ message: "Offer deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

// filtrer offres =========
router.get("/offers", async (req, res) => {
    try {
        const { title, priceMin, priceMax, sort, page = 1 } = req.query

        const filters = {};

        if (title) {
            filters.product_name = new RegExp(title, "i"); // ne pas oublier `i` = insensible à la casse
        }

        if (priceMin || priceMax) {
            filters.product_price = {};
            if (priceMin) filters.product_price.$gte = Number(priceMin);
            if (priceMax) filters.product_price.$lte = Number(priceMax);
        }

        const sortOptions = {}; 
        if (sort === "price-desc")sortOptions.product_price = 1;
        if (sort === "price-asc")sortOptions.product_price = -1;

        const limit = 5;  // gère le nombre d'offre /page 
        const skip = (page -1) * limit;

        const offers = await Offer.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("owner", "account")

        const count = await Offer.countDocuments(filters)

        res.json({ count, offers });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

// récuperer les détails d'une annonce
router.get("/offers/:id", async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id).populate("owner", "account");

        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        res.json(offer)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;

  