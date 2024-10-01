// Packages
import {
	Outlet,
	useOutletContext,
	Navigate,
	useParams,
	Link,
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

// Styles
import styles from './Drive.module.css';

// Components
import { Loading } from '../../utils/Loading/Loading';

// Utils
import { handleFetch } from '../../../utils/handle_fetch';

const sharedDefault = [
	{
		id: '3',
		name: 'first shared file',
		owner: 'facebook@gmail.com',
		type: 'pdf',
		createdAt: new Date(),
	},
	{
		id: '4',
		name: 'second shared file',
		owner: 'google@gmail.com',
		type: 'image',
		createdAt: new Date(),
	},
	{
		id: '8',
		name: 'second shared file',
		owner: 'google@gmail.com',
		type: 'image',
		createdAt: new Date(),
	},
	{
		id: '10',
		name: 'second shared file',
		owner: 'google@gmail.com',
		type: 'image',
		createdAt: new Date(),
	},
];

export const Drive = () => {
	const { onActiveMenu, onActiveModal, menu } = useOutletContext();

	const { folderId, fileId } = useParams();
	const isSmallMobile = useMediaQuery({ maxWidth: 450 });

	const [paths, setPaths] = useState([]);
	const [folders, setFolders] = useState([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const shared = sharedDefault;

	const folder = folderId
		? folders.find(folder => folder.id === folderId)
		: folders[0];

	const handleGetFolder = async folderId => {
		setLoading(true);
		let url = `${import.meta.env.VITE_RESOURCE_URL}/api/folders/${folderId}`;

		const options = {
			method: 'GET',
			credentials: 'include',
		};

		const result = await handleFetch(url, options);

		const handleResult = () => {
			const newFolders = folders.map(folder =>
				folder.id === result.data.id ? result.data : folder,
			);
			setFolders(newFolders);
		};

		result.success ? handleResult() : setError(result.message);
		setLoading(false);
	};

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const handleGetListFolder = async (signal = null) => {
			setLoading(true);
			let url = `${import.meta.env.VITE_RESOURCE_URL}/api/folders`;

			const options = {
				method: 'GET',
				signal,
				credentials: 'include',
			};

			const result = await handleFetch(url, options);

			const handleResult = () => {
				result.success ? setFolders(result.data) : setError(result.message);
				setLoading(false);
			};

			result && handleResult();
		};

		handleGetListFolder(signal);
		return () => controller.abort();
	}, []);

	useEffect(() => {
		const getParentFolderIds = (array, id) => {
			const subfolder = folders.find(folder => folder.id === id);

			return !subfolder
				? array
				: subfolder.parent === null
					? [
							{
								name: subfolder.name,
								id: subfolder.id,
								path: '/drive',
							},
							...array,
						]
					: getParentFolderIds(
							subfolder.id === folderId
								? [...array]
								: [
										{
											name: subfolder.name,
											id: subfolder.id,
											path: `/drive/folders/${subfolder.id}`,
										},
										...array,
									],
							subfolder.parent.id,
						);
		};

		const handleSet = () => {
			const paths = getParentFolderIds([], folderId);
			setPaths(paths.slice(-3));
		};
		folders.length && handleSet();
	useEffect(() => {
		const getAllFileDownloadUrls = async currentFolder => {
			const blobs = await Promise.all(
				currentFolder.files.map(
					async file =>
						new Promise(resolve =>
							fetch(file.secure_url)
								.then(res => resolve(res.blob()))
								.catch(() => resolve(null)),
						),
				),
			);

			const newFiles = currentFolder.files.map((file, i) => ({
				...file,
				download_url: blobs[i] === null ? '' : URL.createObjectURL(blobs[i]),
			}));

			return newFiles;
		};

		const getFileDownloadUrl = async currentFolder => {
			const targetFile = currentFolder.files[currentFolder.files.length - 1];

			const blob = await new Promise(resolve =>
				fetch(targetFile.secure_url)
					.then(res => resolve(res.blob()))
					.catch(() => resolve(null)),
			);

			const newFiles = currentFolder.files.map(file =>
				file.id === targetFile.id
					? {
							...file,
							download_url: blob === null ? '' : URL.createObjectURL(blob),
						}
					: file,
			);

			return newFiles;
		};

		const handleSetDownloadUrls = async folder => {
			const firstFile = folder.files[0];
			const lastFile = folder.files[folder.files.length - 1];

			const newFiles =
				(!firstFile.download_url && (await getAllFileDownloadUrls(folder))) ||
				(!lastFile.download_url && (await getFileDownloadUrl(folder)));

			newFiles &&
				setFolders(
					folders.map(subfolder =>
						subfolder.id === folder.id
							? { ...subfolder, files: newFiles }
							: subfolder,
					),
				);
		};

		folders.length && folder.files.length && handleSetDownloadUrls(folder);
	}, [folder, folders]);

	return (
		<>
			{error ? (
				<Navigate to="/error" state={{ error }} />
			) : (
				<div className={styles.drive}>
					{loading ? (
						<Loading text="Loading..." />
					) : (
						<>
							{paths.length !== 0 && (
								<nav>
									<ul className={styles.paths}>
										{paths.map((item, i) => (
											<li key={`${item.path}`} className={styles['paths-item']}>
												<div className={styles['paths-wrap']}>
													<Link to={item.path} className={styles['paths-link']}>
														{item.name}
													</Link>
													{paths.length - 1 !== i && (
														<span className={styles['paths-icon']}>{'>'}</span>
													)}
												</div>
											</li>
										))}
									</ul>
								</nav>
							)}

							{!fileId && <h2>{folder.name}</h2>}
							<Outlet
								context={{
									folder,
									shared,
									onActiveMenu,
									onActiveModal,
									onGetFolder: handleGetFolder,
									menu,
								}}
							/>
						</>
					)}
				</div>
			)}
		</>
	);
};
