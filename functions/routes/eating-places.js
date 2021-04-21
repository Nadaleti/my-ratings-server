const express = require('express');
const { hasRequiredFields } = require('../request-validators');
const { handleNotFound, handleMissingRequiredFields, handleFirestoreError } = require('../handlers');
const { db } = require('../firebase.config');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { category, name } = req.query;
  const docs = await getEatingPlaces(category, name);
  const eatingPlaces = docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data()
    }
  });

  return res.status(200).send(eatingPlaces);
});

router.get('/:id', async (req, res, next) => {
  const doc = await db.collection('eating-places').doc(req.params.id).get();

  if (!doc.exists) {
    return next(handleNotFound('Place not found'));
  }

  const place = doc.data();
  return res.status(200).send(place);
});

router.post('/', async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'name', 'category', 'cost')) {
    return next(handleMissingRequiredFields());
  }

  await db.collection('eating-places').doc().create({
    ...req.body,
    addresses: req.body.hasOwnProperty('addresses') ? req.body.addresses : [],
    category: req.body.category.toUpperCase(),
  });

  return res.status(201).send();
});

router.put('/:id', async (req, res, next) => {
  if (!hasRequiredFields(req.body, 'name', 'category', 'cost', 'addresses')) {
    return next(handleMissingRequiredFields());
  }

  try {
    await db.collection('eating-places').doc(req.params.id).update({...req.body});
    return res.status(202).send();
  } catch (e) {
    return next(handleFirestoreError(e.code));
  }
});

router.delete('/:id', async (req, res, next) => {
  await db.collection('eating-places').doc(req.params.id).delete();
  return res.status(204).send();
});

const getEatingPlaces = async (category, name) => {
  let query = db.collection('eating-places').orderBy('name', 'asc');

  if (name) query = query.startAt(name).endAt(name + '\uf8ff');
  if (category) query = query.where('category', '==', category);

  return (await query.get()).docs;
}

exports.routes = router;
