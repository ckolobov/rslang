interface Page {
  render(): Promise<string>
  after_render(): Promise<void>
}

export default Page;