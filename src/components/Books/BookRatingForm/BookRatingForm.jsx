import * as PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './BookRatingForm.module.css';
import { generateStarsInputs, displayStars } from '../../../lib/functions';
import { APP_ROUTES } from '../../../utils/constants';
import { useUser } from '../../../lib/customHooks';
import { rateBook } from '../../../lib/common';

function BookRatingForm({
  rating, setRating, userId, setBook, id, userRated,
}) {
  const { connectedUser, auth } = useUser();
  const navigate = useNavigate();
  const { register, formState, handleSubmit } = useForm({
    mode: 'onChange',
    defaultValues: {
      rating: 0,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (formState.dirtyFields.rating) {
      const rate = document.querySelector('input[name="rating"]:checked').value;
      setRating(parseInt(rate, 10));
    }
  }, [formState, setRating]);

  const onSubmit = async () => {
    if (!connectedUser || !auth) {
      navigate(APP_ROUTES.SIGN_IN);
      return;
    }

    if (rating <= 0) {
      setErrorMessage('Veuillez choisir une note avant de soumettre.');
      return;
    }

    setIsSubmitting(true);
    try {
      const update = await rateBook(id, userId, rating);
      if (update) {
        // eslint-disable-next-line no-underscore-dangle
        setBook({ ...update, id: update._id });
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.BookRatingForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>{rating > 0 ? 'Votre Note' : 'Notez cet ouvrage'}</p>
        {errorMessage && <p className={styles.ErrorMessage}>{errorMessage}</p>}
        <div className={styles.Stars}>
          {!userRated ? generateStarsInputs(rating, register) : displayStars(rating)}
        </div>
        {!userRated ? (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi...' : 'Valider'}
          </button>
        ) : null}
      </form>
    </div>
  );
}

BookRatingForm.propTypes = {
  rating: PropTypes.number.isRequired,
  setRating: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  setBook: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  userRated: PropTypes.bool.isRequired,
};

export default BookRatingForm;
