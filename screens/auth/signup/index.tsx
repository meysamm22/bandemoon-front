import React, { useState } from "react";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { LinkText } from "@/components/ui/link";
import Link from "@unitools/link";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
  XIcon,
} from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Keyboard, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { GoogleIcon } from "./assets/icons/google";
import { Pressable } from "@/components/ui/pressable";
import useRouter from "@unitools/router";
import { AuthLayout } from "../layout";
import { Modal } from "@/components/ui/modal";
import { Center } from "@/components/ui/center";

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email(),
  password: z
    .string()
    .min(6, "Must be at least 6 characters in length")
    .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
    .regex(new RegExp(".*[a-z].*"), "One lowercase character")
    .regex(new RegExp(".*\\d.*"), "One number")
    .regex(
      new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
      "One special character"
    ),
  rememberme: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Use & Privacy Policy",
  }),
});
type SignUpSchemaType = z.infer<typeof signUpSchema>;

const SignUpWithLeftBackground = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
  });
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const onSubmit = async (data: SignUpSchemaType) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="success">
                <ToastTitle>Registration successful!</ToastTitle>
              </Toast>
            );
          },
        });
        reset();
      } else {
        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="error">
                <ToastTitle>{result.message}</ToastTitle>
              </Toast>
            );
          },
        });
      }
    } catch (error) {
      toast.show({
        placement: "bottom right",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="error">
              <ToastTitle>Network error. Please try again.</ToastTitle>
            </Toast>
          );
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };
  const router = useRouter();
  return (
    <>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <Icon
              as={ArrowLeftIcon}
              className="md:hidden stroke-background-800"
              size="xl"
            />
          </Pressable>
          <VStack>
            <Heading className="md:text-center" size="3xl">
              Sign up
            </Heading>
            <Text>Sign up and start using gluestack</Text>
          </VStack>
        </VStack>
        <VStack className="w-full">
          <VStack space="xl" className="w-full">
            <FormControl isInvalid={!!errors.firstName}>
              <FormControlLabel>
                <FormControlLabelText>First Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="firstName"
                defaultValue=""
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await signUpSchema.parseAsync({ firstName: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      className="text-sm"
                      placeholder="First Name"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="md" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.firstName?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.lastName}>
              <FormControlLabel>
                <FormControlLabelText>Last Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="lastName"
                defaultValue=""
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await signUpSchema.parseAsync({ lastName: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      className="text-sm"
                      placeholder="Last Name"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="md" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.lastName?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="email"
                defaultValue=""
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await signUpSchema.parseAsync({ email: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      className="text-sm"
                      placeholder="Email"
                      type="text"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="md" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.email?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormControlLabel>
                <FormControlLabelText>Password</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="password"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await signUpSchema.parseAsync({
                        password: value,
                      });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      className="text-sm"
                      placeholder="Password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                      type={showPassword ? "text" : "password"}
                    />
                    <InputSlot onPress={handleState} className="pr-3">
                      <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                    </InputSlot>
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="sm" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.password?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.rememberme}>
              <Controller
                name="rememberme"
                defaultValue={false}
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await signUpSchema.parseAsync({ rememberme: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    size="sm"
                    value="Remember me"
                    isChecked={value}
                    onChange={onChange}
                    aria-label="Remember me"
                  >
                    <CheckboxIndicator>
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                    <CheckboxLabel>
                      I accept the{" "}
                      <Pressable onPress={() => setShowTermsModal(true)}>
                        <Text className="text-primary-600 underline">
                          Terms of Use & Privacy Policy
                        </Text>
                      </Pressable>
                    </CheckboxLabel>
                  </Checkbox>
                )}
              />
              <FormControlError>
                <FormControlErrorIcon size="sm" as={AlertTriangle} />
                <FormControlErrorText>
                  {errors?.rememberme?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </VStack>

          <VStack className="w-full my-7" space="lg">
            <Button 
              className="w-full" 
              onPress={handleSubmit(onSubmit)}
              isDisabled={isLoading}
            >
              <ButtonText className="font-medium">
                {isLoading ? "Signing up..." : "Sign up"}
              </ButtonText>
            </Button>
            <Button
              variant="outline"
              action="secondary"
              className="w-full gap-1"
              onPress={() => {}}
            >
              <ButtonText className="font-medium">
                Continue with Google
              </ButtonText>
              <ButtonIcon as={GoogleIcon} />
            </Button>
          </VStack>
          <HStack className="self-center" space="sm">
            <Text size="md">Already have an account?</Text>
            <Link href="/auth/signin">
              <LinkText
                className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
                size="md"
              >
                Login
              </LinkText>
            </Link>
          </HStack>
        </VStack>
      </VStack>

      {/* Terms and Conditions Modal */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)}>
        <Modal.Content maxWidth="90%" maxHeight="80%">
          <Modal.Header>
            <Heading size="lg">Terms of Use & Privacy Policy</Heading>
            <Pressable onPress={() => setShowTermsModal(false)}>
              <Icon as={XIcon} size="md" />
            </Pressable>
          </Modal.Header>
          <Modal.Body>
            <ScrollView showsVerticalScrollIndicator={true}>
              <VStack space="md">
                <Heading size="md">1. Acceptance of Terms</Heading>
                <Text>
                  By accessing and using Bandemoon, you accept and agree to be bound by the terms and provision of this agreement.
                </Text>

                <Heading size="md">2. Description of Service</Heading>
                <Text>
                  Bandemoon is a platform that connects musicians looking for bands and vice versa. The service includes user profiles, messaging, collaboration tools, and other features designed to facilitate musical connections.
                </Text>

                <Heading size="md">3. User Accounts</Heading>
                <Text>
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
                </Text>

                <Heading size="md">4. Privacy Policy</Heading>
                <Text>
                  We collect and use your personal information to provide and improve our services. Your data is protected and will not be shared with third parties without your consent, except as required by law.
                </Text>

                <Heading size="md">5. User Conduct</Heading>
                <Text>
                  You agree not to use the service to: (a) violate any laws or regulations; (b) infringe upon the rights of others; (c) transmit harmful, offensive, or inappropriate content; (d) attempt to gain unauthorized access to the service.
                </Text>

                <Heading size="md">6. Intellectual Property</Heading>
                <Text>
                  All content on Bandemoon, including but not limited to text, graphics, logos, and software, is the property of Bandemoon or its content suppliers and is protected by copyright laws.
                </Text>

                <Heading size="md">7. Termination</Heading>
                <Text>
                  We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Use or is harmful to other users or the service.
                </Text>

                <Heading size="md">8. Limitation of Liability</Heading>
                <Text>
                  Bandemoon shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                </Text>

                <Heading size="md">9. Changes to Terms</Heading>
                <Text>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
                </Text>

                <Heading size="md">10. Contact Information</Heading>
                <Text>
                  If you have any questions about these Terms of Use or Privacy Policy, please contact us at support@bandemoon.com
                </Text>
              </VStack>
            </ScrollView>
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={() => setShowTermsModal(false)}>
              <ButtonText>Close</ButtonText>
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};

export const SignUp = () => {
  return (
    <AuthLayout>
      <SignUpWithLeftBackground />
    </AuthLayout>
  );
};
