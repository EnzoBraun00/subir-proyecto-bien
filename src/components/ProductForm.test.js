import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react'; // Asegúrate de importar waitFor
import ProductForm from './ProductForm';

// Definir initialFormState fuera del componente para consistencia
const initialFormState = {
  name: '',
  price: '',
  supplierEmail: '',
  entryDate: '',
};

describe('ProductForm', () => {
  // Test 1: Renderiza el formulario correctamente para añadir
  test('renders form for adding new product', () => {
    render(<ProductForm onSubmit={() => {}} productToEdit={null} onCancelEdit={() => {}} />);

    expect(screen.getByLabelText(/nombre del producto/i)).toHaveValue('');
    expect(screen.getByText(/Añadir Producto/i)).toBeInTheDocument();
    expect(screen.queryByText(/Cancelar Edición/i)).not.toBeInTheDocument();
  });

  // Test 2: Renderiza el formulario correctamente para editar
  test('renders form for editing existing product', () => {
    const product = { id: 1, name: 'Laptop Gaming', price: '1200', supplierEmail: 'test@example.com', entryDate: '2023-01-01' };
    render(<ProductForm onSubmit={() => {}} productToEdit={product} onCancelEdit={() => {}} />);

    expect(screen.getByLabelText(/nombre del producto/i)).toHaveValue('Laptop Gaming');
    expect(screen.getByLabelText(/precio/i)).toHaveValue(1200);
    expect(screen.getByLabelText(/correo del proveedor/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/fecha de ingreso/i)).toHaveValue('2023-01-01');
    expect(screen.getByText(/Guardar Cambios/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancelar Edición/i)).toBeInTheDocument();
  });

  // Test 3: Actualiza los datos del formulario al cambiar el producto a editar
  test('updates form data when productToEdit prop changes', () => {
    const { rerender } = render(<ProductForm onSubmit={() => {}} productToEdit={null} onCancelEdit={() => {}} />);

    const product1 = { id: 1, name: 'Product A', price: '100', supplierEmail: 'a@a.com', entryDate: '2023-01-01' };
    rerender(<ProductForm onSubmit={() => {}} productToEdit={product1} onCancelEdit={() => {}} />);
    expect(screen.getByLabelText(/nombre del producto/i)).toHaveValue('Product A');

    const product2 = { id: 2, name: 'Product B', price: '200', supplierEmail: 'b@b.com', entryDate: '2023-02-02' };
    rerender(<ProductForm onSubmit={() => {}} productToEdit={product2} onCancelEdit={() => {}} />);
    expect(screen.getByLabelText(/nombre del producto/i)).toHaveValue('Product B');
  });

  // Test 4: Llama a onSubmit con los datos correctos cuando el formulario es válido
  test('calls onSubmit with correct data when form is valid', async () => { // Usar async/await
    const mockOnSubmit = jest.fn();
    render(<ProductForm onSubmit={mockOnSubmit} productToEdit={null} onCancelEdit={() => {}} />);

    fireEvent.change(screen.getByLabelText(/nombre del producto/i), { target: { name: 'name', value: 'Laptop Gaming' } });
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { name: 'price', value: '1200' } });
    fireEvent.change(screen.getByLabelText(/correo del proveedor/i), { target: { name: 'supplierEmail', value: 'gaming@example.com' } });
    fireEvent.change(screen.getByLabelText(/fecha de ingreso/i), { target: { name: 'entryDate', value: '2023-11-15' } });

    fireEvent.click(screen.getByText(/Añadir Producto/i));

    // Esperamos a que la llamada a mockOnSubmit ocurra.
    // No esperamos que el formulario se resetea AQUI, porque eso es responsabilidad de App.js en la práctica.
    // La prueba unitaria de ProductForm debe verificar su propia responsabilidad:
    // que llama a onSubmit con los datos correctos y que maneja las validaciones.
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Laptop Gaming',
        price: '1200',
        supplierEmail: 'gaming@example.com',
        entryDate: '2023-11-15',
      });
    });
  });

  // Test 5: Muestra errores de validación para campos vacíos
  test('displays validation errors for empty fields', async () => {
    render(<ProductForm onSubmit={() => {}} productToEdit={null} onCancelEdit={() => {}} />);

    fireEvent.click(screen.getByText(/Añadir Producto/i));

    await waitFor(() => {
      expect(screen.getByText(/El nombre del producto es obligatorio./i)).toBeInTheDocument();
      expect(screen.getByText(/El precio debe ser un número mayor a 0./i)).toBeInTheDocument();
      expect(screen.getByText(/El correo del proveedor es obligatorio./i)).toBeInTheDocument();
      expect(screen.getByText(/La fecha de ingreso es obligatoria./i)).toBeInTheDocument();
    });
  });

  // Test 6: Muestra error para precio no numérico
  test('displays validation error for non-numeric price', async () => {
    render(<ProductForm onSubmit={() => {}} productToEdit={null} onCancelEdit={() => {}} />);
  
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { name: 'price', value: 'abc' } });
    fireEvent.click(screen.getByText(/Añadir Producto/i));
  
    await waitFor(() => {
      // CAMBIO AQUÍ: Asegúrate que el texto de la aserción coincida con el componente.
      expect(screen.getByText(/El precio debe ser un número mayor a 0./i)).toBeInTheDocument();
    });
  });

  // Test 7: Muestra error para correo electrónico inválido
  test('displays validation error for invalid email', async () => {
    render(<ProductForm onSubmit={() => {}} productToEdit={null} onCancelEdit={() => {}} />);

    fireEvent.change(screen.getByLabelText(/correo del proveedor/i), { target: { name: 'supplierEmail', value: 'invalid-email' } });
    fireEvent.click(screen.getByText(/Añadir Producto/i));

    await waitFor(() => {
      expect(screen.getByText(/Formato de correo electrónico inválido./i)).toBeInTheDocument();
    });
  });

  // Test 8: Llama a onCancelEdit cuando el botón cancelar edición es clicado
  test('calls onCancelEdit when cancel edit button is clicked', () => {
    const mockOnCancelEdit = jest.fn();
    const product = { id: 1, name: 'Product to edit', price: '100', supplierEmail: 'edit@test.com', entryDate: '2023-01-01' };
    render(<ProductForm onSubmit={() => {}} productToEdit={product} onCancelEdit={mockOnCancelEdit} />);

    fireEvent.click(screen.getByText(/Cancelar Edición/i));
    expect(mockOnCancelEdit).toHaveBeenCalledTimes(1);
  });
});