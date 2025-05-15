const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../middleware/isAuthenticated");


router.post("/offer/publish", isAuthenticated, async (req, res) => {
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
                {MARQUE: brand},
                {TAILLE: size},
                {ETAT: condition},
                {COULEUR: color},
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
})


module.exports = router;


