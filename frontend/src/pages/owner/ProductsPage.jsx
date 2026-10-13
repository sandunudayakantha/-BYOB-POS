import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useBranch } from '../../contexts/BranchContext';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  PhotoIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

import { ProductViewModal } from '@/app/components/products/product-view-modal.component';
import { ProductFeatureModal } from '@/app/components/products/product-feature-modal.component';
import { ProductFormModal } from '@/app/components/products/product-form-modal.component';

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const { activeBranch } = useBranch();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [featuringProduct, setFeaturingProduct] = useState(null);

  // Pagination & Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 10;

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    prepTime: '15-20 mins',
    image: '',
    available: true
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['ownerCategories', activeBranch?._id],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { branchId: activeBranch?._id } });
      return res.data;
    },
    enabled: !!activeBranch
  });

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['ownerProducts', activeBranch?._id, currentPage, searchTerm],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: {
          branchId: activeBranch?._id,
          page: currentPage,
          limit: pageSize,
          search: searchTerm
        }
      });
      return res;
    },
    enabled: !!activeBranch
  });

  const products = productsResponse?.data || [];
  const meta = productsResponse?.meta || { total: products.length, page: 1, limit: pageSize, totalPages: 1 };

  const { data: featuredSections = [] } = useQuery({
    queryKey: ['featuredSections', activeBranch?._id],
    queryFn: async () => {
      const res = await api.get('/featured', { params: { branchId: activeBranch?._id } });
      return res.data;
    },
    enabled: !!activeBranch
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = new FormData();
      payload.append('name', data.name);
      payload.append('categoryId', data.categoryId);
      payload.append('description', data.description || '');
      payload.append('prepTime', data.prepTime || '15-20 mins');
      payload.append('available', data.available);

      if (imageFile) {
        payload.append('image', imageFile);
      } else if (data.image) {
        payload.append('image', data.image);
      }

      if (editingProduct) {
        return api.put(`/products/${editingProduct._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      payload.append('branchId', activeBranch._id);
      return api.post('/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      toast.success(editingProduct ? 'Product updated!' : 'Product added to catalog!');
      queryClient.invalidateQueries(['ownerProducts']);
      handleClose();
    },
    onError: (err) => toast.error(err.message || 'Failed to save product.')
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ sectionId, productIds }) => {
      return api.put(`/featured/${sectionId}`, { products: productIds });
    },
    onSuccess: () => {
      toast.success('Featured status updated!');
      queryClient.invalidateQueries(['featuredSections', activeBranch?._id]);
    },
    onError: (err) => toast.error(err.message || 'Failed to update featured banner.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted.');
      queryClient.invalidateQueries(['ownerProducts']);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete product.')
  });

  const handleOpenEdit = (prod = null) => {
    setImageFile(null);
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name,
        categoryId: prod.category?._id || '',
        description: prod.description || '',
        prepTime: prod.prepTime || '15-20 mins',
        image: prod.image || '',
        available: prod.available
      });
      setImagePreview(prod.image || '');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        categoryId: categories[0]?._id || '',
        description: '',
        prepTime: '15-20 mins',
        image: '',
        available: true
      });
      setImagePreview('');
    }
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenView = (prod) => {
    setViewingProduct(prod);
    setViewModalOpen(true);
  };

  const handleOpenFeature = (prod) => {
    setFeaturingProduct(prod);
    setFeatureModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setViewModalOpen(false);
    setFeatureModalOpen(false);
    setEditingProduct(null);
    setViewingProduct(null);
    setFeaturingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const columns = [
    {
      header: 'Product Details',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
            {row.image ? (
              <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <PhotoIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{row.name}</span>
            </div>
            <div className="text-xs text-slate-400 line-clamp-1">{row.description || 'No description'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category.name',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300">{row.category?.name || 'Unassigned'}</span>
    },
    { header: 'Prep Time', accessor: 'prepTime' },
    {
      header: 'Availability',
      accessor: 'available',
      render: (row) => <Badge variant={row.available ? 'active' : 'inactive'}>{row.available ? 'Available' : 'Sold Out'}</Badge>
    },
    {
      header: 'Actions',
      render: (row) => {
        const featuredInCount = featuredSections.filter((s) =>
          s.products?.some((p) => (p._id || p) === row._id)
        ).length;

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenView(row)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="View Product Details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenFeature(row)}
              className={`py-1.5 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1 transition ${
                featuredInCount > 0
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
              }`}
              title="Add or remove product from Featured Banners"
            >
              <span>{featuredInCount > 0 ? `Featured (${featuredInCount})` : 'Feature'}</span>
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Edit Product"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete ${row.name}?`)) deleteMutation.mutate(row._id);
              }}
              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Product"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Global Product Catalog ({activeBranch?.name})
          </h2>
          <p className="text-sm text-slate-500">
            View product specs or feature items on promo banners directly from this catalog.
          </p>
        </div>
        <button
          onClick={() => handleOpenEdit()}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={isLoading}
        searchPlaceholder="Search catalog..."
        onSearch={handleSearch}
        serverPagination={true}
        page={currentPage}
        pageSize={pageSize}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={setCurrentPage}
      />

      <ProductViewModal
        isOpen={viewModalOpen}
        onClose={handleClose}
        product={viewingProduct}
        featuredSections={featuredSections}
        onOpenFeature={handleOpenFeature}
        onOpenEdit={handleOpenEdit}
      />

      <ProductFeatureModal
        isOpen={featureModalOpen}
        onClose={handleClose}
        product={featuringProduct}
        featuredSections={featuredSections}
        onToggleFeature={(sectionId, productIds) => {
          toggleFeatureMutation.mutate({ sectionId, productIds });
        }}
      />

      <ProductFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        imageFile={imageFile}
        setImageFile={setImageFile}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        handleFileChange={handleFileChange}
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate(formData);
        }}
        isSubmitting={saveMutation.isPending}
      />
    </div>
  );
};

export default ProductsPage;
