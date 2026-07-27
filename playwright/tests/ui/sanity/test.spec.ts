import {test,expect} from '@playwright/test';



test('testing playwright', async({page}) => {
    await page.goto('/');
    // await page.getByRole('link', {name:'Sign in'}).click();
    // await page.getByText('Sign in').click();
    // await page.getByText(/Sign in/i).click();
    // await page.getByText(/SIGN IN/i).click();
    // await page.locator('a.ghost',{hasText:'Sign in'}).click();
    // await page.locator('a[href="/sign-in"]').click();
    // await expect(page.getByText(/A NEW FREQUENCY OF STORY/i)).toBeVisible();
    // await expect(page.locator('p[class="eyebrow"]',{hasText:/A NEW FREQUENCY OF STORY/i})).toBeVisible();
    // const text_read = await page.locator('a[class="button"][href="/sign-in?returnTo=/browse"]').innerText();
    // console.log(text_read)
    // await page.getByRole('link', {name:'Start watching'}).click();
    // await page.locator('a[class="ghost"]',{ hasText:'Sign in'}).click();
    await page.waitForTimeout(2000)

    // const text1 = await page.locator('[class=demo-note]').innerText();
    // console.log(text1)
    // await page.reload();
    // await page.goto('/browser');
    const url = page.url();
    const header_title = await page.title();
    await page.getByText(/Sign in/i).click()
    await page.getByRole('textbox',{name:'Email'}).fill('river@streamforge.test');
    await page.getByRole('textbox',{name:'Password'}).fill('stream123');
    await page.getByRole('button', {name:'Sign in'}).click();
    await expect(page).toHaveURL('/browse');
    await page.getByPlaceholder('Title or keyword').fill('Afterlight')
});
