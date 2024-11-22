import { expect, describe, it, vi } from 'vitest';
import {
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter, Outlet } from 'react-router-dom';
import { Context as ResponsiveContext } from 'react-responsive';
import { supabase } from '../../../utils/supabase_client';
import { handleFetch } from '../../../utils/handle_fetch';

import { Drive } from '../../../components/pages/Drive/Drive';
import { UploadList } from '../../../components/pages/Drive/Upload_List';
import { Navbar } from '../../../components/layout/Navbar/Navbar';
import { Footer } from '../../../components/layout/Footer/Footer';

vi.mock('../../../utils/supabase_client');
vi.mock('../../../utils/handle_fetch');
vi.mock('../../../components/pages/Drive/Upload_List');
vi.mock('../../../components/layout/Navbar/Navbar');
vi.mock('../../../components/layout/Footer/Footer');

describe('Drive component', () => {
	it(`should navigate to '/error' path if fetch folders or shared files fails`, async () => {
		const mockContext = {
			menu: {
				name: '',
			},
			onActiveMenu: vi.fn(),
			onActiveModal: vi.fn(),
		};

		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: { access_token: '' },
			},
		});

		handleFetch.mockResolvedValue({
			success: false,
			message: 'error',
		});

		const router = createMemoryRouter([
			{
				path: '/',
				element: <Outlet context={{ ...mockContext }} />,
				children: [
					{
						index: true,
						element: <Drive />,
					},
					{ path: 'error', element: <p>Error page</p> },
				],
			},
		]);

		handleFetch.mockResolvedValue({
			success: false,
			message: 'error',
		});

		render(<RouterProvider router={router} />);

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

		const errorMessage = screen.getByText('Error page');

		expect(errorMessage).toBeInTheDocument();
	});
	it(`should render default folder name if url path is '/drive'`, async () => {
		const mockContext = {
			menu: {
				name: '',
			},
			onActiveMenu: vi.fn(),
			onActiveModal: vi.fn(),
		};

		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: { access_token: '' },
			},
		});

		handleFetch
			.mockResolvedValueOnce({
				success: true,
				data: [],
			})
			.mockResolvedValueOnce({
				success: true,
				data: [
					{
						id: '1',
						name: 'folder name',
					},
				],
			});

		const router = createMemoryRouter(
			[
				{
					path: '/drive',
					element: <Outlet context={{ ...mockContext }} />,
					children: [
						{
							index: true,
							element: <Drive />,
						},
					],
				},
			],
			{ initialEntries: ['/drive'] },
		);

		render(<RouterProvider router={router} />);

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

		const folderName = screen.getByText('folder name');

		expect(folderName).toBeInTheDocument();
	});
	it(`should display up to 2 levels of folder paths when the user is in a subfolder at any level and the user's device screen is smaller than 700 pixels.`, async () => {
		const mockContext = {
			menu: {
				name: '',
			},
			onActiveMenu: vi.fn(),
			onActiveModal: vi.fn(),
		};

		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: { access_token: '' },
			},
		});

		const mockFolders = [
			{
				id: '1',
				name: 'default folder',
				parent: null,
			},
			{
				id: '2',
				name: 'second folder',
				parent: {
					id: '1',
				},
			},
			{
				id: '3',
				name: 'third folder',
				parent: {
					id: '2',
				},
			},
		];

		handleFetch
			.mockResolvedValueOnce({
				success: true,
				data: [],
			})
			.mockResolvedValueOnce({
				success: true,
				data: mockFolders,
			});

		const router = createMemoryRouter(
			[
				{
					path: '/drive',
					element: <Outlet context={{ ...mockContext }} />,
					children: [
						{
							path: ':folderId',
							element: (
								<ResponsiveContext.Provider value={{ width: 600 }}>
									<Drive />
								</ResponsiveContext.Provider>
							),
						},
					],
				},
			],
			{ initialEntries: ['/drive/3'] },
		);

		render(<RouterProvider router={router} />);

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

		mockFolders.slice(-2).forEach(folder => {
			const path = screen.getByRole('link', { name: folder.name });
			expect(path).toBeInTheDocument();
		});
	});
	it(`should display up to 3 levels of folder paths when the user is in a subfolder at any level and the user's device screen is wider than 700 pixels.`, async () => {
		const mockContext = {
			menu: {
				name: '',
			},
			onActiveMenu: vi.fn(),
			onActiveModal: vi.fn(),
		};

		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: { access_token: '' },
			},
		});

		const mockFolders = [
			{
				id: '1',
				name: 'default folder',
				parent: null,
			},
			{
				id: '2',
				name: 'second folder',
				parent: {
					id: '1',
				},
			},
			{
				id: '3',
				name: 'third folder',
				parent: {
					id: '2',
				},
			},
			{
				id: '4',
				name: 'fourth folder',
				parent: {
					id: '3',
				},
			},
		];

		handleFetch
			.mockResolvedValueOnce({
				success: true,
				data: [],
			})
			.mockResolvedValueOnce({
				success: true,
				data: mockFolders,
			});

		const router = createMemoryRouter(
			[
				{
					path: '/drive',
					element: <Outlet context={{ ...mockContext }} />,
					children: [
						{
							path: ':folderId',
							element: (
								<ResponsiveContext.Provider value={{ width: 700 }}>
									<Drive />
								</ResponsiveContext.Provider>
							),
						},
					],
				},
			],
			{ initialEntries: ['/drive/4'] },
		);

		render(<RouterProvider router={router} />);

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

		mockFolders.slice(-3).forEach(folder => {
			const path = screen.getByRole('link', { name: folder.name });
			expect(path).toBeInTheDocument();
		});
	});
	it(`should display up to 4 levels of folder paths when the user is in a subfolder at any level and the user's device screen is wider than 1024 pixels.`, async () => {
		const mockContext = {
			menu: {
				name: '',
			},
			onActiveMenu: vi.fn(),
			onActiveModal: vi.fn(),
		};

		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: { access_token: '' },
			},
		});

		const mockFolders = [
			{
				id: '1',
				name: 'default folder',
				parent: null,
			},
			{
				id: '2',
				name: 'second folder',
				parent: {
					id: '1',
				},
			},
			{
				id: '3',
				name: 'third folder',
				parent: {
					id: '2',
				},
			},
			{
				id: '4',
				name: 'fourth folder',
				parent: {
					id: '3',
				},
			},
			{
				id: '5',
				name: 'fifth folder',
				parent: {
					id: '4',
				},
			},
		];

		handleFetch
			.mockResolvedValueOnce({
				success: true,
				data: [],
			})
			.mockResolvedValueOnce({
				success: true,
				data: mockFolders,
			});

		const router = createMemoryRouter(
			[
				{
					path: '/drive',
					element: <Outlet context={{ ...mockContext }} />,
					children: [
						{
							path: ':folderId',
							element: (
								<ResponsiveContext.Provider value={{ width: 1024 }}>
									<Drive />
								</ResponsiveContext.Provider>
							),
						},
					],
				},
			],
			{ initialEntries: ['/drive/5'] },
		);

		render(<RouterProvider router={router} />);

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

		mockFolders.slice(-4).forEach(folder => {
			const path = screen.getByRole('link', { name: folder.name });
			expect(path).toBeInTheDocument();
		});
	});
	it(`should render sidebar and footer components if the user's device screen is wider than 700 pixels`, async () => {
		const mockContext = {
			menu: {
				name: '',
			},
			onActiveMenu: vi.fn(),
			onActiveModal: vi.fn(),
		};

		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: { access_token: '' },
			},
		});

		const mockFolders = [
			{
				id: '1',
				name: 'default folder',
				parent: null,
			},
		];

		handleFetch
			.mockResolvedValueOnce({
				success: true,
				data: [],
			})
			.mockResolvedValueOnce({
				success: true,
				data: mockFolders,
			});

		UploadList.mockImplementationOnce(() => <p>UploadList component</p>);
		Navbar.mockImplementationOnce(() => <p>Navbar component</p>);
		Footer.mockImplementationOnce(() => <p>Footer component</p>);

		const router = createMemoryRouter([
			{
				path: '/',
				element: <Outlet context={{ ...mockContext }} />,
				children: [
					{
						index: true,
						element: (
							<ResponsiveContext.Provider value={{ width: 700 }}>
								<Drive />
							</ResponsiveContext.Provider>
						),
					},
				],
			},
		]);

		render(<RouterProvider router={router} />);

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

		const uploadList = screen.getByText('UploadList component');
		const navbar = screen.getByText('Navbar component');
		const footer = screen.getByText('Footer component');

		expect(uploadList).toBeInTheDocument();
		expect(navbar).toBeInTheDocument();
		expect(footer).toBeInTheDocument();
	});
	it(`should render upload button if the user's device screen is smaller than 700 pixels`, async () => {
		const mockContext = {
			menu: {
				name: '',
			},
			onActiveMenu: vi.fn(),
			onActiveModal: vi.fn(),
		};

		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: { access_token: '' },
			},
		});

		const mockFolders = [
			{
				id: '1',
				name: 'default folder',
				parent: null,
			},
		];

		handleFetch
			.mockResolvedValueOnce({
				success: true,
				data: [],
			})
			.mockResolvedValueOnce({
				success: true,
				data: mockFolders,
			});

		UploadList.mockImplementationOnce(() => <p>UploadList component</p>);
		Navbar.mockImplementationOnce(() => <p>Navbar component</p>);
		Footer.mockImplementationOnce(() => <p>Footer component</p>);

		const router = createMemoryRouter([
			{
				path: '/',
				element: <Outlet context={{ ...mockContext }} />,
				children: [
					{
						index: true,
						element: (
							<ResponsiveContext.Provider value={{ width: 600 }}>
								<Drive />
							</ResponsiveContext.Provider>
						),
					},
				],
			},
		]);

		render(<RouterProvider router={router} />);

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

		const button = screen.getByTitle('upload-button');

		expect(button).toBeInTheDocument();
	});
	it('should active upload menu if upload button is clicked', async () => {
		const user = userEvent.setup();
		const mockContext = {
			menu: {
				name: 'upload-menu',
			},
			onActiveMenu: vi.fn(),
			onActiveModal: vi.fn(),
		};

		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: { access_token: '' },
			},
		});

		const mockFolders = [
			{
				id: '1',
				name: 'default folder',
				parent: null,
			},
		];

		handleFetch
			.mockResolvedValueOnce({
				success: true,
				data: [],
			})
			.mockResolvedValueOnce({
				success: true,
				data: mockFolders,
			});

		UploadList.mockImplementationOnce(() => <p>UploadList component</p>);

		const router = createMemoryRouter([
			{
				path: '/',
				element: <Outlet context={{ ...mockContext }} />,
				children: [
					{
						index: true,
						element: (
							<ResponsiveContext.Provider value={{ width: 600 }}>
								<Drive />
							</ResponsiveContext.Provider>
						),
					},
				],
			},
		]);

		render(<RouterProvider router={router} />);

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

		const button = screen.getByTitle('upload-button');

		await user.click(button);

		const uploadList = screen.getByText('UploadList component');

		expect(mockContext.onActiveMenu).toBeCalledTimes(1);
		expect(uploadList).toBeInTheDocument();
	});
});