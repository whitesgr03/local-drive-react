// Packages
import {
	Link,
	useOutletContext,
	useNavigate,
	Navigate,
	useLocation,
} from 'react-router-dom';
import { useState } from 'react';
import classNames from 'classnames/bind';
import { object, string, ref } from 'yup';
import { supabase } from '../../../utils/supabase_client';

// Styles
import accountStyles from './Account.module.css';
import { icon } from '../../../styles/icon.module.css';
import formStyles from '../../../styles/form.module.css';
import ValidationEmailStyles from './Validation_Email.module.css';

// Components
import { Account } from './Account';
import { ValidationEmail } from './Validation_Email';

// Variables
const classes = classNames.bind(formStyles);
const DEFAULT_FORM_DATA = {
	email: '',
	password: '',
	confirmPassword: '',
};

export const Register = () => {
	const { onActiveModal } = useOutletContext();
	const navigate = useNavigate();

	const [inputErrors, setInputErrors] = useState({});
	const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
	const [registering, setRegistering] = useState(false);
	const [error, setError] = useState(null);
	const { pathname: previousPath } = useLocation();

	const handleChange = e => {
		const { value, name } = e.target;
		const fields = {
			...formData,
			[name]: value,
		};
		setFormData(fields);
	};

	const verifyScheme = async () => {
		let result = {
			success: true,
			fields: {},
		};

		try {
			const schema = object({
				email: string()
					.trim()
					.email('Email must be in standard format.')
					.required('Email is required.'),
				password: string()
					.matches(
						/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+-=[\]{};':"|<>?,./`~])(?=.{8,})/,
						'Password must contain one or more numbers, special symbols, lowercase and uppercase characters, and at least 8 characters.',
					)
					.required('Password is required.'),
				confirmPassword: string()
					.required('Confirm password is required.')
					.oneOf(
						[ref('password')],
						'Confirmation password is not the same as the password.',
					),
			}).noUnknown();
			await schema.validate(formData, {
				abortEarly: false,
				stripUnknown: true,
			});
		} catch (err) {
			for (const error of err.inner) {
				result.fields[error.path] = error.message;
			}
			result.success = false;
		}

		return result;
	};

	const handleRegister = async () => {
		const { email, password } = formData;

		const result = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: import.meta.env.VITE_REDIRECT_URI,
			},
		});

		const handleError = error => {
			switch (error.code) {
				case 'over_email_send_rate_limit':
					onActiveModal({
						component: (
							<p>
								You sent the verification email too many times, please try again
								in one hour.
							</p>
						),
					});
					break;
				default:
					setError(error.message);
			}
		};

		const handleSuccess = () => {
			onActiveModal({
				component: (
					<ValidationEmail>
						<p>
							Check your email and find the{' '}
							<span className={ValidationEmailStyles.highlight}>
								Rokulezrive Email Verification{' '}
							</span>
							to complete the signup within 1 hours.
						</p>
					</ValidationEmail>
				),
			});
			navigate('/account/login');
		};

		result.data?.user?.identities.length > 0
			? handleSuccess()
			: !result.error
				? setInputErrors({
						email: 'Email has been registered.',
					})
				: handleError(result.error);
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setRegistering(true);

		const validationResult = await verifyScheme();

		const handleValid = async () => {
			setInputErrors({});
			await handleRegister();
		};

		validationResult.success
			? await handleValid()
			: setInputErrors(validationResult.fields);
		setRegistering(false);
	};

	return (
		<>
			{error ? (
				<Navigate to="/error" state={{ error, previousPath }} />
			) : (
				<Account title="User Sign Up" loading={registering}>
					<div className={accountStyles['account-form-wrap']}>
						<form className={formStyles.form} onSubmit={handleSubmit}>
							<div>
								<label htmlFor="email" className={formStyles['form-label']}>
									Email
									<input
										onChange={handleChange}
										value={formData.email}
										type="text"
										id="email"
										className={classes({
											'form-input': true,
											'form-input-bgc': true,
											'form-input-error': inputErrors.email,
										})}
										name="email"
										title="The email is required and must be standard format."
									/>
								</label>
								<div
									className={classes({
										'form-message-wrap': true,
										'form-message-active': inputErrors.email,
									})}
									data-testid="email-message"
								>
									<span className={`${icon} ${formStyles.alert}`} />
									<p className={formStyles['form-message']}>
										{inputErrors.email ?? 'Message Placeholder'}
									</p>
								</div>
							</div>
							<div>
								<label htmlFor="password" className={formStyles['form-label']}>
									Password
									<input
										onChange={handleChange}
										value={formData.password}
										type="password"
										id="password"
										className={`${classes({
											'form-input': true,
											'form-input-bgc': true,
											'form-input-error': inputErrors.password,
										})}`}
										name="password"
										title="The password is required."
									/>
								</label>
								<div
									className={classes({
										'form-message-wrap': true,
										'form-message-active': inputErrors.password,
									})}
									data-testid="password-message"
								>
									<span className={`${icon} ${formStyles.alert}`} />
									<p className={formStyles['form-message']}>
										{inputErrors.password ?? 'Message Placeholder'}
									</p>
								</div>
							</div>
							<div>
								<label
									htmlFor="confirmPassword"
									className={formStyles['form-label']}
								>
									Confirm Password
									<input
										onChange={handleChange}
										value={formData.confirmPassword}
										type="password"
										id="confirmPassword"
										className={`${classes({
											'form-input': true,
											'form-input-bgc': true,
											'form-input-error': inputErrors.confirmPassword,
										})}`}
										name="confirmPassword"
										title="The confirm password must be the same as the password."
									/>
								</label>
								<div
									className={classes({
										'form-message-wrap': true,
										'form-message-active': inputErrors.confirmPassword,
									})}
									data-testid="confirm-password-message"
								>
									<span className={`${icon} ${formStyles.alert}`} />
									<p className={formStyles['form-message']}>
										{inputErrors.confirmPassword ?? 'Message Placeholder'}
									</p>
								</div>
							</div>

							<button type="submit" className={`${formStyles['form-submit']}`}>
								Submit
							</button>
						</form>
					</div>
					<div className={accountStyles['account-link-wrap']}>
						<p>Already have an account?</p>
						<Link className={accountStyles['account-link']} to="/account/login">
							Sign in account
						</Link>
					</div>
				</Account>
			)}
		</>
	);
};
