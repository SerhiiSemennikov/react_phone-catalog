import './ProductDetailsPage.scss';
import { useContext, useState, useEffect, FC } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Linkline } from '../../shared/Linkline';
import { ProductDetails } from '../../types/ProductDetails';
import { ProductContentTop } from '../../components/ProductContentTop';
import { ProductContentBottom } from '../../components/ProductContentBottom';
import { GlobalContext } from '../../context/GlobalContext';
import { ProductsSlider } from '../../shared/ProductsSlider';
import { ButtonBack } from '../../shared/ButtonBack';
import { getSpecificProducts } from '../../utils/api';
import { Loader } from '../../shared/Loader';
import { Product } from '../../types/Product';

const getSuggestedProducts = (
  allProducts: Product[],
  currentCategory: string,
  productItemId: string,
) => {
  return allProducts.filter(
    prod => prod.category === currentCategory && prod.itemId !== productItemId,
  );
  //.sort(() => 0.5 - Math.random());
};

export const ProductDetailsPage: FC = () => {
  const { allProducts } = useContext(GlobalContext);

  const { productId = '' } = useParams();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [productsArray, setProductsArray] = useState<ProductDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | ''>('');

  const currentCategory = useLocation().pathname.split('/')[1];

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage('');

    const timeout = setTimeout(() => {
      getSpecificProducts(currentCategory)
        .then(fetchedSpecificProducts => {
          setProductsArray(fetchedSpecificProducts);

          const currentProduct = fetchedSpecificProducts.find(
            prod => prod.id === productId,
          );

          if (currentProduct) {
            setProduct(currentProduct);
            setErrorMessage('');
          } else {
            setProduct(null);
            setErrorMessage('Product not found');
          }
        })
        .catch(e => {
          setErrorMessage(`
            Error loading products: The product category "${currentCategory}" does not exist. ${e.name}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory]);

  useEffect(() => {
    if (!productId || !productsArray.length) {
      return;
    }

    const currentProduct = productsArray.find(
      currProduct => currProduct.id === productId,
    );

    if (currentProduct) {
      setProduct(currentProduct);
      setErrorMessage('');
    } else {
      setProduct(null);
      setErrorMessage('Product not found');
    }
  }, [productId, productsArray]);

  const suggestedProducts = productId
    ? getSuggestedProducts(allProducts, currentCategory, productId)
    : [];

  if (isLoading) {
    return (
      <div className="detailsPage">
        <Loader />
      </div>
    );
  }

  if (errorMessage && !isLoading) {
    return (
      <div className="detailsPage">
        <div className="detailsPage__error-message">
          <span>{errorMessage}</span>
          <Link to="/" className="detailsPage__error-link">
            Go to HomePage
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return;
  }

  return (
    <div className="detailsPage">
      {/* {errorMessage && !isLoading && (
        <div className="error-message">
          <span>{errorMessage}</span>
          <Link to="/">Go to HomePage</Link>
        </div>
      )}*/}

      <Linkline productType={currentCategory} productName={product.name} />

      <ButtonBack />

      <h2 className="detailsPage__title">{product.name}</h2>

      <ProductContentTop
        selectedProduct={product}
        specificProducts={productsArray}
      />

      <ProductContentBottom selectedProduct={product} />

      <div className="detailsPage__like-block">
        <ProductsSlider
          title="You may also like"
          products={suggestedProducts}
          displayType="with-discount"
        />
      </div>
    </div>
  );
};
