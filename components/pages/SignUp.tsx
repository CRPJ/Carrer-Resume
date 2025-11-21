"use client";
import coinbaseIcon from "@/public/images/authentication/coinbase.png";
import discordIcon from "@/public/images/authentication/discord.png";
import googleIcon from "@/public/images/authentication/google.png";
import metaIcon from "@/public/images/authentication/meta.png";
import metamaskIcon from "@/public/images/authentication/metamask.png";
import phantomIcon from "@/public/images/authentication/phantom.png";
import rainbowIcon from "@/public/images/authentication/rainbow.png";
import steamIcon from "@/public/images/authentication/steam.png";
import trustIcon from "@/public/images/authentication/trust.png";
import twitchIcon from "@/public/images/authentication/twitch.png";
import twitterIcon from "@/public/images/authentication/twitter.png";
import walletConnectIcon from "@/public/images/authentication/wallet-connect.png";
import walletIcon from "@/public/images/authentication/wallet.png";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const SignUpPage = () => {
  const [walletModal, setWalletModal] = useState(false);
  const [isEmailTab, setIsEmailTab] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  return (
    <main className="nftg-content-two">
      {/* <!-- ==== authentication section start ==== --> */}
      <section className="authentication pt-120 pb-120 fade-wrapper">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="authentication__wrapper text-center">
                <div className="mb-55">
                  <h2 className="title-lg fw-8 stroked-text transform-none title-animation">Hello Gamer</h2>
                  <p className="text-xl mt-12 text-alter">Getting Started Is Easy.</p>
                </div>
                <div className="authentication__inner">
                  {isEmailTab ? (
                    <div className="oauth-tab">
                      <div className="oauth-btns">
                        <button aria-label="continue with google" title="continue with google" className="btn--tertiary">
                          <Image src={googleIcon} alt="Google" width={24} height={24} />
                          Google
                          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                            <path d="M0 0  L100 0  L100 70 L89 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                          </svg>
                        </button>
                        <button aria-label="continue with discord" title="continue with discord" className="btn--tertiary">
                          <Image src={discordIcon} alt="Discord" width={24} height={24} />
                          Discord
                          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                            <path d="M0 0  L100 0  L100 70 L89 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                          </svg>
                        </button>
                        <button aria-label="continue with facebook" title="continue with facebook" className="btn--tertiary">
                          <Image src={metaIcon} alt="Facebook" width={24} height={24} />
                          Facebook
                          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                            <path d="M0 0  L100 0  L100 70 L89 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                          </svg>
                        </button>
                        <button aria-label="continue with twitter" title="continue with twitter" className="btn--tertiary">
                          <Image src={twitterIcon} alt="Twitter" width={24} height={24} />
                          Twitter
                          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                            <path d="M0 0  L100 0  L100 70 L89 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                          </svg>
                        </button>
                        <button aria-label="continue with twitch" title="continue with twitch" className="btn--tertiary">
                          <Image src={twitchIcon} alt="Twitch" width={24} height={24} />
                          Twitch
                          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                            <path d="M0 0  L100 0  L100 70 L89 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                          </svg>
                        </button>
                        <button aria-label="continue with steam" title="continue with steam" className="btn--tertiary">
                          <Image src={steamIcon} alt="Steam" width={24} height={24} />
                          Steam
                          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                            <path d="M0 0  L100 0  L100 70 L89 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                          </svg>
                        </button>
                      </div>
                      <div className="divider-wrapper">
                        <hr />
                        <span className="text-uppercase fw-5">OR</span>
                        <hr />
                      </div>
                      <div className="wallet-authentication">
                        <div className="btn-wrapper">
                          <button onClick={() => setWalletModal(!walletModal)} className="btn--secondary open-wallet-modal" aria-label="Sign Up with wallet" title="Sign Up with wallet">
                            <Image src={walletIcon} alt="Wallet" width={24} height={24} />
                            Sign Up With Wallet
                          </button>
                        </div>
                        <div className={`wallet-modal ${walletModal && "wallet-modal-active"}`}>
                          <div className="wallet-modal-intro">
                            <h6 className="fw-4">Connect a Wallet</h6>
                            <button className="close-wallet-modal" aria-label="close modal">
                              <i className="ti ti-x"></i>
                            </button>
                          </div>
                          <div className="wallet-modal-body">
                            <div className="wallet-modal-body-inner">
                              <ul>
                                <li>
                                  <button aria-label="metamask" title="metamask">
                                    <Image src={metamaskIcon} alt="metamask" width={24} height={24} />
                                    MetaMask
                                  </button>
                                </li>
                                <li>
                                  <button aria-label="rainbow" title="rainbow">
                                    <Image src={rainbowIcon} alt="rainbow" width={24} height={24} />
                                    Rainbow
                                  </button>
                                </li>
                                <li>
                                  <button aria-label="wallet connect" title="wallet connect">
                                    <Image src={walletConnectIcon} alt="wallet connect" width={24} height={24} />
                                    WalletConnect
                                  </button>
                                </li>
                                <li>
                                  <button aria-label="phantom" title="phantom">
                                    <Image src={phantomIcon} alt="phantom" width={24} height={24} />
                                    Phantom
                                  </button>
                                </li>
                                <li>
                                  <button aria-label="trust wallet" title="trust wallet">
                                    <Image src={trustIcon} alt="trust wallet" width={24} height={24} />
                                    Trust Wallet
                                  </button>
                                </li>
                                <li>
                                  <button aria-label="coinbase wallet" title="coinbase wallet">
                                    <Image src={coinbaseIcon} alt="coinbase wallet" width={24} height={24} />
                                    Coinbase Wallet
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="c-email mt-16">
                        <button onClick={() => setIsEmailTab(!isEmailTab)} aria-label="continue with email" title="continue with email" className="change-action open-custom">
                          Continue With Email <i className="ti ti-arrow-narrow-right"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="custom-tab">
                      <form action="#" method="post">
                        <div className="input-single">
                          <label htmlFor="userName">Your Name</label>
                          <div className="ic-group">
                            <input type="text" name="user-name" id="userName" placeholder="Full Name" required />
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                              <path d="M0 0  L100 0  L100 75 L92 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                            </svg>
                            <i className="ti ti-user"></i>
                          </div>
                        </div>
                        <div className="input-single">
                          <label htmlFor="userEmailc">Your Email</label>
                          <div className="ic-group">
                            <input type="email" name="user-emailc" id="userEmailc" placeholder="Enter Email" required />
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                              <path d="M0 0  L100 0  L100 75 L92 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                            </svg>
                            <i className="ti ti-mail"></i>
                          </div>
                        </div>
                        <div className="input-single">
                          <label htmlFor="userPasswordc">Password</label>
                          <div className="ic-group pass">
                            <i className="ti ti-key"></i>
                            <i className={`ti  show-pass ${showPass ? "ti-eye" : "ti-eye-off"}`} onClick={() => setShowPass(!showPass)}></i>
                            <input type={showPass ? "text" : "password"} name="user-Passwordc" id="userPasswordc" placeholder="Enter Password" required />
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                              <path d="M0 0  L100 0  L100 75 L92 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                            </svg>
                          </div>
                        </div>
                        <div className="input-single mb-0">
                          <label htmlFor="userPasswordCon">Confirm Password</label>
                          <div className="ic-group pass">
                            <i className="ti ti-key"></i>
                            <i className={`ti  show-pass ${showPassConfirm ? "ti-eye" : "ti-eye-off"}`} onClick={() => setShowPassConfirm(!showPassConfirm)}></i>
                            <input type={showPassConfirm ? "text" : "password"} name="user-PasswordCon" id="userPasswordCon" placeholder="Confirm Password" required />
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" preserveAspectRatio="none" className="cmn-shape">
                              <path d="M0 0  L100 0  L100 75 L92 100 L0 100 Z" vectorEffect="non-scaling-stroke" />
                            </svg>
                          </div>
                        </div>
                        <div className="btn-wrapper mt-40">
                          <button className="btn--secondary" aria-label="Create Account" title="Create Account">
                            {" "}
                            Create Account{" "}
                          </button>
                        </div>
                      </form>
                      <div className="c-email mt-16">
                        <button onClick={() => setIsEmailTab(!isEmailTab)} aria-label="go back to social connections" title="go back to social connections" className="change-action go-back">
                          <i className="ti ti-arrow-narrow-left"></i>Go Back
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="mt-60 h-a text-start">
                    <p>
                      Have an account? <Link href="/sign-in">Sign In!</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ==== / authentication section end ==== --> */}
    </main>
  );
};

export default SignUpPage;
