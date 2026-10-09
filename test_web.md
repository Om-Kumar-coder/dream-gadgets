======== BASE ========

Open https://www.dreamgadgets.in and verify the Dream Gadgets storefront home page loads with its product sections and header navigation.

Open https://www.dreamgadgets.in/admin and verify that it redirects to the admin login page at https://www.dreamgadgets.in/admin/login.

======== AUTHENTICATION — ADMIN ========

Open https://www.dreamgadgets.in/admin/login, enter owner@dreamgadgets.in in the email/phone field, enter Test@1234 in the password field, click the login button, and verify that the shop owner dashboard loads at https://www.dreamgadgets.in/admin/dashboard.

Open https://www.dreamgadgets.in/admin/login, enter manager@dreamgadgets.in in the email/phone field, enter Test@1234 in the password field, click the login button, and verify that the admin dashboard loads for the store manager.

Open https://www.dreamgadgets.in/admin/login, enter shopsales@dreamgadgets.in in the email/phone field, enter Test@1234 in the password field, click the login button, and verify that the dashboard loads for the shop sales account.

Open https://www.dreamgadgets.in/admin/login, enter storesales@dreamgadgets.in in the email/phone field, enter Test@1234 in the password field, click the login button, and verify that the dashboard loads for the store sales account.

Open https://www.dreamgadgets.in/admin/login, enter calling@dreamgadgets.in in the email/phone field, enter Test@1234 in the password field, click the login button, and verify that the dashboard loads for the calling staff account.

Open https://www.dreamgadgets.in/admin/login, enter employee@dreamgadgets.in in the email/phone field, enter Test@1234 in the password field, click the login button, and verify that the login succeeds for the basic employee account.

Open https://www.dreamgadgets.in/admin/login, enter 9800000001 in the email/phone field, enter Test@1234 in the password field, click the login button, and verify that login works with the phone number instead of the email.

After logging in as owner@dreamgadgets.in, refresh the browser page and verify that the session persists and the dashboard reloads without asking for credentials again.

After logging in as owner@dreamgadgets.in, open the user dropdown in the top-right header, click Logout, and verify that you are returned to the admin login page.

After logging out, open https://www.dreamgadgets.in/admin/dashboard directly and verify that you are redirected to the login page instead of seeing the dashboard.

After logging out, click the browser back button and verify that the protected dashboard is not shown and you remain logged out.

Log in again as owner@dreamgadgets.in with Test@1234 and verify the dashboard loads, confirming the login-back flow works.

Open https://www.dreamgadgets.in/admin/login, enter owner@dreamgadgets.in in the email/phone field, enter WrongPassword1 in the password field, click the login button, and verify that an invalid-credentials error is shown and no dashboard loads.

Open https://www.dreamgadgets.in/admin/login, enter nobody@example.com in the email/phone field, enter Test@1234 in the password field, click the login button, and verify that an unknown-account error is shown and no dashboard loads.

Open https://www.dreamgadgets.in/admin/login, leave both fields empty, click the login button, and verify that required-field validation blocks the submission.

Open https://www.dreamgadgets.in/admin/login, enter owner@dreamgadgets.in, leave the password empty, click the login button, and verify that a password-required error appears.

While logged out, open https://www.dreamgadgets.in/admin/sales directly and verify you are redirected to the admin login page.

While logged out, open https://www.dreamgadgets.in/admin/users directly and verify you are redirected to the admin login page.

While logged out, open https://www.dreamgadgets.in/admin/settings directly and verify you are redirected to the admin login page.

While logged out, open https://www.dreamgadgets.in/admin/reports directly and verify you are redirected to the admin login page.

While logged out, open https://www.dreamgadgets.in/admin/sales/pos directly and verify you are redirected to the admin login page and no point-of-sale screen is rendered.

While logged out, open https://www.dreamgadgets.in/admin/notifications directly and verify you are redirected to the admin login page.

While logged out, open https://www.dreamgadgets.in/admin/branches directly and verify you are redirected to the admin login page.

While logged out, open https://www.dreamgadgets.in/admin/banners directly and verify you are redirected to the admin login page.

======== AUTHENTICATION — STOREFRONT ========

Open https://www.dreamgadgets.in/login, enter owner@dreamgadgets.in in the field labelled "Enter your email or phone", enter Test@1234 in the field labelled "Enter your password", submit, and verify that the storefront signs you in and shows the account state in the header.

After signing in to the storefront, refresh the page and verify that you remain signed in.

After signing in to the storefront, click Logout in the header and verify you are signed out.

Open https://www.dreamgadgets.in/login, click Forgot Password, and verify that the password reset page loads.

Open https://www.dreamgadgets.in/register, fill the first name field with Webtest, the last name field with Customer, an email of webtest.customer@example.com, and a phone number, and verify that the form validates each step including the phone verification step; if an OTP screen appears and no code can be retrieved, stop without completing the registration.

Open https://www.dreamgadgets.in/login, enter owner@dreamgadgets.in with a wrong password, submit, and verify that an error message is shown.

While signed out of the storefront, open https://www.dreamgadgets.in/account and verify that it asks you to sign in instead of showing account details.

While signed out of the storefront, open https://www.dreamgadgets.in/orders and verify that it shows the "Sign in Required" message.

While signed out of the storefront, open https://www.dreamgadgets.in/wishlist and verify the page loads and shows an empty or sign-in state without crashing.

======== RBAC — shop_owner (owner@dreamgadgets.in) ========

Log in as owner@dreamgadgets.in, open the sidebar, and verify that every module link is visible: Dashboard, Purchases, Sales / POS, Inventory, Stores, Accessories, Clients, Transfers, Exchange, Online Orders, Buyback Leads, Price Guide, Returns, Coupons, EMI Plans, Refunds, Reports, GST Reports, Notifications, Users & Roles, Brand Heroes, Announcement Bar, Inbox, Templates, Campaigns, Banners, and Settings.

As owner@dreamgadgets.in, click Dashboard in the sidebar and verify the dashboard opens.

As owner@dreamgadgets.in, click Purchases and verify the purchases list opens showing "All device acquisitions".

As owner@dreamgadgets.in, click Sales / POS and verify the sales list opens showing "All completed transactions".

As owner@dreamgadgets.in, click Inventory and verify the inventory list opens showing "All inventory items".

As owner@dreamgadgets.in, click Stores and verify the store list opens showing the three Dream Gadgets branches.

As owner@dreamgadgets.in, click Accessories and verify the accessories page opens.

As owner@dreamgadgets.in, click Clients and verify the client list opens showing "All registered clients".

As owner@dreamgadgets.in, click Transfers and verify the transfers page opens.

As owner@dreamgadgets.in, click Exchange and verify the exchange page opens showing "Exchange Devices".

As owner@dreamgadgets.in, click Online Orders and verify the orders list opens.

As owner@dreamgadgets.in, click Buyback Leads and verify the buyback leads list opens.

As owner@dreamgadgets.in, click Price Guide and verify the "Buyback Price Guide" opens.

As owner@dreamgadgets.in, click Returns and verify the returns page opens showing "Manage product returns".

As owner@dreamgadgets.in, click Coupons and verify the coupons list opens.

As owner@dreamgadgets.in, click EMI Plans and verify the EMI page opens.

As owner@dreamgadgets.in, click Refunds and verify the refunds page opens with its search field "Search order #, customer, payment ID...".

As owner@dreamgadgets.in, click Reports and verify "Reports & Analytics" opens.

As owner@dreamgadgets.in, click GST Reports and verify the GST page opens.

As owner@dreamgadgets.in, click Notifications and verify the notifications page opens.

As owner@dreamgadgets.in, click Users & Roles and verify the users page opens showing "Manage admin users".

As owner@dreamgadgets.in, click Brand Heroes and verify the brands page opens.

As owner@dreamgadgets.in, click Announcement Bar and verify the announcement editor opens.

As owner@dreamgadgets.in, click Inbox under WhatsApp and verify the conversation list opens with its "Search conversations…" field.

As owner@dreamgadgets.in, click Templates and verify the WhatsApp templates page opens.

As owner@dreamgadgets.in, click Campaigns and verify the WhatsApp campaigns page opens.

As owner@dreamgadgets.in, click Banners and verify the banner management page opens.

As owner@dreamgadgets.in, click Settings and verify the settings page opens.

======== RBAC — store_manager (manager@dreamgadgets.in) ========

Log in as manager@dreamgadgets.in, open the sidebar, and verify that Dashboard, Purchases, Sales / POS, Inventory, Stores, Accessories, Clients, Transfers, Exchange, Online Orders, Buyback Leads, Price Guide, Returns, Coupons, EMI Plans, Refunds, Reports, GST Reports, Notifications, and Users & Roles are visible.

As manager@dreamgadgets.in, verify that Brand Heroes is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/brands directly and verify the page denies access or loads no brand data.

As manager@dreamgadgets.in, verify that Announcement Bar is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/announcement-bar directly and verify the page denies access or loads no announcement data.

As manager@dreamgadgets.in, open https://www.dreamgadgets.in/admin/users and verify the users list loads because this role has user viewing permission.

As manager@dreamgadgets.in, open the Users & Roles page and verify that role and permission editing controls are read-only or denied for this account.

As manager@dreamgadgets.in, open https://www.dreamgadgets.in/admin/settings?tab=Roles and verify that role settings are viewable but saving changes is denied for this account.

As manager@dreamgadgets.in, open https://www.dreamgadgets.in/admin/settings?tab=Permissions and verify that permission changes cannot be saved by this account.

As manager@dreamgadgets.in, open the Stores page and verify this account can view branches but cannot create or delete a branch.

As manager@dreamgadgets.in, open the dashboard and verify it loads with sales and stock statistics.

======== RBAC — shop_sales (shopsales@dreamgadgets.in) ========

Log in as shopsales@dreamgadgets.in, open the sidebar, and verify that Dashboard, Purchases, Sales / POS, Inventory, Accessories, Clients, Exchange, Online Orders, Buyback Leads, Price Guide, Returns, Coupons, EMI Plans, and Refunds are visible.

As shopsales@dreamgadgets.in, verify that Transfers is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/transfers directly and verify access is denied or no transfer data loads.

As shopsales@dreamgadgets.in, verify that Reports is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/reports directly and verify access is denied or no report data loads.

As shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/gst directly and verify GST data is denied for this account.

As shopsales@dreamgadgets.in, verify that Notifications is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/notifications directly and verify access is denied or no notifications load.

As shopsales@dreamgadgets.in, verify that Users & Roles is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/users directly and verify access is denied or no users load.

As shopsales@dreamgadgets.in, verify that Stores is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/branches directly and verify access is denied or no branch data loads.

As shopsales@dreamgadgets.in, verify that Brand Heroes and Announcement Bar are not visible in the sidebar.

As shopsales@dreamgadgets.in, open the Sales / POS page and verify that the Export controls on the sales list are hidden or disabled for this account.

As shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/sales/pos, search for a product, add it to the cart, and verify that completing a sale is allowed for this role.

As shopsales@dreamgadgets.in, open the Clients page and verify client creation is available to this account.

======== RBAC — store_sales (storesales@dreamgadgets.in) ========

Log in as storesales@dreamgadgets.in, open the sidebar, and verify the visible modules match a sales account: Dashboard, Purchases, Sales / POS, Inventory, Accessories, Clients, Exchange, Online Orders, Buyback Leads, Price Guide, Returns, Coupons, EMI Plans, and Refunds are visible.

As storesales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/transfers directly and verify transfer access is denied.

As storesales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/reports directly and verify report access is denied.

As storesales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/users directly and verify user-management access is denied.

As storesales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/notifications directly and verify notification access is denied.

As storesales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/branches directly and verify branch access is denied.

As storesales@dreamgadgets.in, open the WhatsApp Inbox, open any conversation, and verify this account can view conversations but the send control is disabled or sending is denied, because this role has view-only WhatsApp permission.

As storesales@dreamgadgets.in, open the Sales / POS page and verify the Export controls are hidden or disabled.

======== RBAC — calling_staff (calling@dreamgadgets.in) ========

Log in as calling@dreamgadgets.in, open the sidebar, and verify that Dashboard, Purchases, Sales / POS, Inventory, Accessories, Clients, Online Orders, Buyback Leads, Price Guide, Returns, Coupons, EMI Plans, Refunds, and WhatsApp Inbox/Templates/Campaigns are visible.

As calling@dreamgadgets.in, verify that Exchange is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/exchange directly and verify access is denied or no exchange data loads.

As calling@dreamgadgets.in, verify that Transfers is not visible in the sidebar, then open https://www.dreamgadgets.in/admin/transfers directly and verify access is denied.

As calling@dreamgadgets.in, open https://www.dreamgadgets.in/admin/reports directly and verify report access is denied.

As calling@dreamgadgets.in, open https://www.dreamgadgets.in/admin/gst directly and verify GST access is denied.

As calling@dreamgadgets.in, open https://www.dreamgadgets.in/admin/users directly and verify user-management access is denied.

As calling@dreamgadgets.in, open https://www.dreamgadgets.in/admin/settings directly and verify settings cannot be edited by this account.

As calling@dreamgadgets.in, open the Inventory page and verify only viewing is possible: no edit controls are enabled for stock items.

As calling@dreamgadgets.in, open the Clients page, click New Client, and verify that creating and editing clients is allowed for this role.

As calling@dreamgadgets.in, open the Online Orders page and verify this account can open an order and edit it, since the calling role holds orders edit permission.

======== RBAC — employee (employee@dreamgadgets.in) ========

Log in as employee@dreamgadgets.in, open the sidebar, and verify that Clients is the only permission-gated module visible, and that Dashboard, Purchases, Sales / POS, Inventory, Stores, Transfers, Exchange, Online Orders, Buyback Leads, Price Guide, Returns, Coupons, EMI Plans, Refunds, Reports, GST Reports, Notifications, and Users & Roles are all hidden.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/dashboard directly and verify the dashboard is denied or shows no data for this account.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/sales directly and verify sales access is denied.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/sales/pos directly and verify the point of sale is denied and no sale can be started.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/inventory directly and verify inventory access is denied.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/purchases directly and verify purchase access is denied.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/reports directly and verify report access is denied.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/users directly and verify user-management access is denied.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/settings directly and verify settings changes are denied.

As employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/buyback directly and verify buyback access is denied.

As employee@dreamgadgets.in, open the Clients page, verify the client list loads read-only, and verify that no create or edit control is enabled for this account.

======== BRANCH / STORE RESTRICTIONS ========

Log in as owner@dreamgadgets.in, open Stores, and verify that three branches are listed: "Dream Gadgets — Chetla (Main Branch)", "Dream Gadgets 2.0 — Jadavpur", and "Dream Gadgets 3.0 — Champahati".

Log in as owner@dreamgadgets.in, open the branch selector, select "Dream Gadgets 2.0 — Jadavpur", and verify the dashboard and lists now show data for that branch.

As owner@dreamgadgets.in, select "Dream Gadgets 3.0 — Champahati" in the branch selector, open Sales, and verify the sales list is scoped to that branch.

As owner@dreamgadgets.in, select "Dream Gadgets — Chetla (Main Branch)" again and verify the sales list shows the main-branch sales.

Log in as manager@dreamgadgets.in, open the branch selector, and verify which branches this store manager can switch to and that list data follows the selected branch.

Log in as shopsales@dreamgadgets.in, open the POS page, and verify the "Selling from store" indicator shows the store this account sells from.

Log in as storesales@dreamgadgets.in, open Inventory, and verify the visible stock is scoped to the assigned store rather than all branches, and that the branch filter only offers the permitted store.

Log in as employee@dreamgadgets.in, open Clients, and verify any branch filter shown is limited to the account's assigned branch.

======== DASHBOARD ========

Open https://www.dreamgadgets.in/admin/dashboard as owner@dreamgadgets.in and verify the dashboard loads with its statistic cards.

Verify the dashboard shows the sales summary card and that it shows "No sales recorded yet" only when no sales exist for the period.

Verify the dashboard shows the stock card and that the chart area shows "No stock data yet" only when there is no stock data.

Verify the dashboard shows the "Stock by Condition" chart with condition breakdown.

Verify the dashboard shows the "Buyback Leads" card with the lead count.

Verify the dashboard shows the "By Status" breakdown chart.

Verify the dashboard shows the "Battery Health" statistic.

Verify the dashboard shows the "Body Condition" statistic.

Verify the dashboard shows the "Screen Condition" statistic.

Click each statistic card link on the dashboard and verify it navigates to the matching module page.

Click the sidebar Dashboard link from another module and verify the dashboard reloads correctly.

Refresh the dashboard page and verify it still loads with the same statistics.

Change the branch selector on the dashboard, verify the statistics change for that branch, then switch back to the main branch.

======== POS ========

Log in as owner@dreamgadgets.in and open https://www.dreamgadgets.in/admin/sales/pos.

Verify the POS screen loads with the search field labelled "Search by IMEI, model, brand, or accessory…" and the Order Summary panel.

Verify the "Selling from store" indicator shows the store this sale will be recorded against.

Type a device model name into the search field and verify matching inventory items appear in the results.

Click a matching device in the results and verify it is added as a line item in the order with its Item name and Price.

Type an IMEI of a stocked device into the search field and verify the exact device matches and can be added.

Type an accessory name into the search field and verify the accessory appears and can be added to the order.

Increase the quantity of the first line item and verify the line total and Order Summary total update accordingly.

Decrease the quantity back to 1 and verify the totals update back.

Remove a line item from the order and verify the Order Summary total decreases.

Verify the Order Summary shows the Subtotal, Tax, and Total amounts and that Total equals Subtotal plus Tax minus any discount.

Apply a discount to the order using the discount control, verify the Total decreases by the discount, then remove the discount and verify the Total returns to the original value.

Add a customer to the sale using the customer selector if one is offered, and verify the selected customer appears on the sale.

Fill the field labelled "Email for invoice (optional)" with omkumar.coder@gmail.com and verify it is accepted.

Select the payment method "Cash" and verify it becomes the selected payment.

Select the payment method "Card" and verify it becomes the selected payment.

Select the payment method "UPI/NEFT" and verify it becomes the selected payment.

Select payment method "Cash", enter an amount higher than the total in the amount-paid field, and verify the button shows the change amount as "Refund ₹… change".

With the order complete and payment method selected, click the button labelled "Complete Sale — ₹…" and verify the sale is created and you are taken to the sale or a success state.

After completing the sale, verify no second sale was created for the same order by opening https://www.dreamgadgets.in/admin/sales, searching for the sale, and confirming exactly one matching record.

After completing the sale, open https://www.dreamgadgets.in/admin/inventory, search for the sold product, and verify the stock quantity decreased by the quantity sold.

After completing the sale, open the sale from the Sales list and verify the Order Details section shows the correct product, quantity, price, tax, and total.

Refresh the sale detail page and verify the sale still shows the same data and payment.

Leave the POS order empty and click the complete-sale button if it is enabled, and verify the application blocks an empty sale instead of creating a record.

Enter an invalid or negative quantity on a POS line item and verify the application rejects it.

Attempt to complete a POS sale without selecting a payment method and verify the application asks for a payment method instead of creating an invalid sale.

While on the POS page, make the browser go offline, complete a sale, and verify the toast "Sale queued — will sync when back online" appears instead of a confirmation.

Restore the browser to online, wait for the sync to finish, open https://www.dreamgadgets.in/admin/sales, and verify the queued sale appears exactly once in the list.

Log in as shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/sales/pos, complete a small test sale, and verify a sales account can create a sale.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/sales/pos directly, and verify the POS is denied for this account.

======== SALES ========

Open https://www.dreamgadgets.in/admin/sales and verify the sales list loads with the heading "Sales" and "All completed transactions".

Use the search field on the Sales page to search for the most recent test sale and verify it appears in the results.

Use the branch filter on the Sales page, select a specific branch, and verify only that branch's sales are listed.

Use the date-range filters on the Sales page and verify the list narrows to sales within the selected range.

Use the status filter on the Sales page and verify voided sales appear only when the voided status is selected.

Open the most recent sale from the sales list and verify the detail page shows Order Details, Payments, and Metadata sections.

On the sale detail, verify the Client field shows the customer or "Walk-in" for anonymous sales.

On the sale detail, verify the Branch field shows the branch the sale was made in.

On the sale detail, verify the Subtotal, Tax, Discount, and Total values are displayed.

On the sale detail, verify the Payments section lists the payment method and amount used.

On the sale detail, verify each line item shows the product, quantity, and price.

Refresh the sale detail page and verify the same data is still shown.

On the sale detail, click Download PDF and verify a PDF file downloads.

On the sale detail, click Email Invoice, provide omkumar.coder@gmail.com as the recipient if asked, send it, and verify the application reports the actual result with the toast "Invoice queued for email delivery" or an error.

On the sale detail, click WhatsApp Invoice if present and verify the application reports the actual queueing result with "Invoice queued for WhatsApp delivery" or an error, without claiming delivery.

Use the Export control on the Sales list to export sales and verify a file downloads.

Open an old historical sale from the list and verify it opens with intact details, then do not modify it.

Open a sale that is already marked Voided and verify the "Voided" status is shown and further voiding is not offered.

Open a voided sale and verify its Payments section still records what happened.

Create a fresh POS sale, open it from the Sales list, click Void Sale, confirm the dialog "Are you sure you want to void this sale?", and verify the toast "Sale voided successfully" appears and the status changes to Voided.

After voiding, refresh the sale page and verify the Voided status persists.

After voiding, open Inventory, search the sold product, and verify the stock reflects the void.

Log in as calling@dreamgadgets.in, open the Sales list, and verify sales are visible but the Export controls are hidden or disabled for this role.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/sales directly, and verify the sales list is denied.

======== PDF ========

Create a POS sale containing one device, open the newly created sale, click Download PDF, verify that a PDF file downloads, open the downloaded PDF, and verify the invoice contains the product name, quantity, price, tax, total, and payment information.

Open an older sale, click Download PDF, open the downloaded PDF, and verify the invoice number, branch name, and customer details are printed correctly.

======== EMAIL INVOICE ========

Open the newly created sale, click Email Invoice, enter omkumar.coder@gmail.com as the recipient if the application asks for a recipient, send the invoice, and verify that the application reports the actual result of the email operation.

Open a different existing sale, click Email Invoice, leave the recipient empty if a recipient field is shown, submit, and verify the application validates the empty recipient instead of silently sending.

Open a sale, click Email Invoice, enter an invalid email address such as "not-an-email", submit, and verify the application reports a validation error.

======== PURCHASES ========

Open https://www.dreamgadgets.in/admin/purchases and verify the purchase list loads with the heading "Purchases" and "All device acquisitions".

Use the search field on the Purchases list to search for an existing purchase and verify it appears.

Use the filters on the Purchases list to filter by supplier or status and verify the list narrows accordingly.

Click New Purchase on the Purchases list and verify the "New Purchase Entry" form opens with "Record a new device acquisition".

On the purchase form, fill the "Vendor Details" section with a test vendor name.

On the purchase form, open the "Device Details" section, click "Select brand", and choose a seeded brand such as Samsung.

On the purchase form, click "Select model" and choose an available model.

On the purchase form, set Colour to a test colour, Storage to 128GB, and Condition to Good using their selectors.

On the purchase form, set "Supply Type" to "With Box", then change it to "Without Box", and verify the selection updates.

Enable the "Accessories Only" option, verify the form switches to accessory mode, then disable it and verify it returns to device mode.

In the "Pricing" section, enter a purchase price, quantity of 1, and a tax rate, and verify the form computes the total.

Add a note in the "Notes" field of the purchase form.

Submit the purchase form and verify the purchase is created and appears at the top of the Purchases list.

Open the newly created purchase from the list and verify it shows the vendor, brand, model, condition, quantity, price, and total exactly as entered.

Refresh the purchase detail page and verify the saved data persists.

Open https://www.dreamgadgets.in/admin/inventory, search for the purchased model, and verify the stock quantity increased by the purchased quantity.

Submit the purchase form with all fields empty and verify required-field validation blocks the submission and shows error messages.

Enter a negative quantity in the purchase pricing section and verify the form rejects it.

Enter a non-numeric price in the purchase pricing section and verify the form rejects it.

Cancel the purchase form after making changes and verify no purchase is created in the list.

Open an existing historical purchase and verify its details load, then leave it unchanged.

Log in as shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/purchases/new directly, and verify purchase creation is allowed for this role.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/purchases directly and verify purchase access is denied.

======== INVENTORY ========

Open https://www.dreamgadgets.in/admin/inventory and verify the inventory list loads with the heading "Inventory" and "All inventory items".

Use the search field on the Inventory page to search by model name and verify matching items appear.

Use the search field on the Inventory page to search by IMEI and verify the exact device appears.

Use the search field on the Inventory page to search by brand and verify items of that brand are listed.

Use the "All Stores" branch filter on the Inventory page, select one store, and verify only that store's stock is listed.

Use the condition filter on the Inventory page and verify only items in the selected condition are listed.

Open an inventory item from the list and verify the detail shows the product name, brand, model, condition, storage, colour, IMEI, branch, stock, buying price, and selling price.

Verify the detail shows the product images if any were uploaded, and that an item without images does not break the layout.

Open the edit control on an inventory item and verify the "Edit Inventory Item" dialog opens with the item's current values.

In the edit dialog, change the selling price using the "Change Selling Price" control, save, refresh the page, and verify the new selling price persists.

Open the "Manage Product Photos" control on an inventory item, verify the photo manager opens, attempt to add an 11th photo if ten are already present, and verify the message "Maximum of 10 photos per product reached." appears.

In the photo manager, hover a photo and verify the "Remove photo" control appears, then close the dialog without removing any photo.

Open the delete control on an inventory item and verify the confirmation dialog "Delete this inventory item?" appears, then click Cancel and verify the item still exists.

Open an inventory item that has no stock and verify it is clearly marked out of stock.

After creating a POS sale, refresh the Inventory search for that product and verify the stock decreased by the sold quantity.

After voiding a sale, refresh the Inventory search for that product and verify the stock reflects the void.

After creating a purchase, refresh the Inventory search for the purchased model and verify the stock increased.

Open https://www.dreamgadgets.in/admin/accessories and verify accessories are listed with their stock.

Log in as calling@dreamgadgets.in, open Inventory, and verify edit controls are disabled or hidden for this view-only role.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/inventory directly and verify inventory access is denied.

======== STORES / BRANCHES ========

Open https://www.dreamgadgets.in/admin/branches and verify the store list shows "Dream Gadgets — Chetla (Main Branch)", "Dream Gadgets 2.0 — Jadavpur", and "Dream Gadgets 3.0 — Champahati".

Open the "Dream Gadgets — Chetla (Main Branch)" store from the list and verify its detail shows address, city, state, pincode, phone, WhatsApp number, email, Instagram, working hours, GSTIN, and sort order.

Open the "Dream Gadgets 2.0 — Jadavpur" store and verify its detail loads with its own address and contact information.

Open the "Dream Gadgets 3.0 — Champahati" store and verify its detail loads.

Use the store search or filter on the branches list and verify filtering by branch name works.

Edit a branch's working hours field, save, refresh the page, and verify the change persists; then restore the original working hours and save again.

Attempt to edit the GSTIN of a branch to an invalid value and verify validation rejects it, then leave the field unchanged and cancel.

Open the POS page and verify the branch context ("Selling from store") matches the selected branch in the header selector.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/branches directly, and verify branch access is denied.

======== ACCESSORIES ========

Open https://www.dreamgadgets.in/admin/accessories and verify the accessories list loads.

Use the search field on the Accessories page to search for an accessory by name and verify it appears.

Use the category or filter controls on the Accessories page and verify the list narrows to the selected category.

Click New Item or New on the Accessories page and verify the accessory creation form opens.

Fill the accessory creation form with a test accessory named "ZZ Webtest Accessory", set a price and a stock quantity of 1, and submit; verify the accessory appears in the list.

Open the newly created "ZZ Webtest Accessory" from the list and verify its details show the price and stock you entered.

Refresh the Accessories list and verify the new accessory persists.

Edit the test accessory's price, save, refresh, and verify the new price persists.

Add the test accessory to a POS cart and verify it appears in the order and its price matches the accessories list.

Delete the "ZZ Webtest Accessory" using the supported delete control if one exists; otherwise deactivate it, then verify it no longer appears in the default list.

Submit the accessory form with empty required fields and verify validation errors appear.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/accessories directly and verify access is denied.

======== CLIENTS ========

Open https://www.dreamgadgets.in/admin/clients and verify the client list loads with the heading "All registered clients".

Use the search field on the Clients page to search an existing client by name and verify it appears.

Use the search field on the Clients page to search a client by phone number and verify it appears.

Use the filters on the Clients page to filter clients and verify the list narrows.

Click New Client on the Clients page and verify the client creation form opens.

Create a client named "ZZ Webtest Client" with phone 9876500001 and email zz.webtest@example.com, save, and verify the client appears in the list.

Open the newly created "ZZ Webtest Client" and verify the detail shows name, phone, email, and created date.

Refresh the client detail page and verify the saved data persists.

Edit the test client's phone number to 9876500002, save, refresh, and verify the new phone persists.

Open an existing real client from the list and verify the customer history and associated sales are shown, then leave the client unchanged.

Submit the client form with an empty name and verify a required-field error appears.

Submit the client form with a phone number shorter than 10 digits and verify phone validation rejects it.

Submit the client form with an invalid email such as "not-an-email" and verify email validation rejects it.

Submit the client form with a duplicate phone number that already exists and verify the application reports the duplicate.

Cancel the client form after typing values and verify no client is created.

Delete the "ZZ Webtest Client" using the supported delete control if the UI offers it, then verify it no longer appears in the list; if no delete control exists, leave the test client in place.

Log in as employee@dreamgadgets.in, open Clients, and verify the client list loads but no create or edit control is enabled.

======== TRANSFERS ========

Open https://www.dreamgadgets.in/admin/transfers and verify the transfers page loads.

Use the search field labelled "Search by IMEI, brand, or model…" to search for a device and verify matches appear.

Click New Transfer on the Transfers page and verify the transfer creation form opens.

Select "Dream Gadgets — Chetla (Main Branch)" as the source branch in the transfer form.

Select "Dream Gadgets 2.0 — Jadavpur" as the destination branch in the transfer form.

Search for a stocked device in the transfer form by IMEI, select it, set quantity to 1, and submit the transfer.

After creating the transfer, verify the transfer appears in the transfers list with its source branch, destination branch, product, quantity, and pending status.

Open the newly created transfer from the list and verify its details match what was entered.

Refresh the transfer detail page and verify the transfer persists.

Open Inventory, filter stock for "Dream Gadgets — Chetla (Main Branch)", search the transferred product, and verify the source quantity decreased.

Open Inventory, filter stock for "Dream Gadgets 2.0 — Jadavpur", search the transferred product, and verify the destination quantity increased.

Use the status control on the transfer to mark it received or completed if that action is offered, and verify the status updates after refresh.

Attempt to create a transfer with the source and destination set to the same branch and verify the application rejects it.

Submit the transfer form with no product selected and verify validation blocks the submission.

Attempt to create a transfer with quantity greater than available source stock and verify the application rejects it.

Log in as shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/transfers directly, and verify transfer access is denied for this role.

======== EXCHANGE ========

Open https://www.dreamgadgets.in/admin/exchange and verify the exchange page loads with the heading "Exchange Devices".

Click New Exchange on the Exchange page and verify the exchange form opens.

Enter a 10-digit phone number in the "10-digit phone" field of the exchange form.

Enter a 15-digit IMEI in the "15-digit IMEI" field of the exchange form.

Enter the old device details in the exchange form: brand, model such as Samsung, storage such as 128GB, colour such as Black, and condition.

Verify the exchange form shows an estimated exchange value for the entered device.

Complete the exchange by selecting a new device and submitting, then verify the exchange appears in the exchange list.

Open the newly created exchange from the list and verify it shows the customer phone, old device IMEI, device details, and estimated price.

Refresh the exchange page and verify the saved exchange persists.

Submit the exchange form with a phone number shorter than 10 digits and verify validation rejects it.

Submit the exchange form with an IMEI shorter than 15 digits and verify validation rejects it.

Use the filters on the exchange list to filter exchanges and verify the list narrows.

Log in as calling@dreamgadgets.in, open https://www.dreamgadgets.in/admin/exchange directly and verify exchange access is denied for this role.

======== ONLINE ORDERS ========

Open https://www.dreamgadgets.in/admin/orders and verify the online orders list loads.

Use the search field on the orders list to search an order by order number and verify it appears.

Use the status filter on the orders list and verify only orders in the selected status are shown.

Open an order from the list and verify the detail page shows Order Number, Customer, Shipping Address, Order Details, Payments, Status, Timeline, and Actions sections.

On the order detail, verify each ordered product shows its name, quantity, price, and line total.

On the order detail, verify the Subtotal, Discount, Tax, and Total values are displayed.

On the order detail, verify the Payments section shows the payment method and payment status.

On the order detail, verify the Timeline section lists the status history with timestamps.

Use the status action in the Actions section to move an order to the next status, confirm if prompted, refresh the page, and verify the new status persists.

Attempt to move an order backward to an invalid previous status if the UI offers such a control and verify the application rejects the invalid transition.

Refresh the order detail page and verify all data remains unchanged apart from the status you intentionally changed.

Open an order with status "Guest" customer type and verify the customer section shows guest details without crashing.

Place a test order from the storefront checkout first, then open the orders list, search that order, and verify it appears with the correct products and totals.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/orders directly and verify order access is denied.

======== BUYBACK LEADS ========

Open https://www.dreamgadgets.in/admin/buyback and verify the "Buyback Leads" list loads, or shows "No buyback leads found" when empty.

Submit a buyback form from the storefront at https://www.dreamgadgets.in/buyback with a test phone number and device details, then refresh the admin Buyback Leads list and verify the new lead appears.

Open a buyback lead from the list and verify the "Lead Details" section shows Phone, Device Type, Brand, Model, Estimated Price, Status, Notes, and Submitted timestamp.

On the lead detail, verify the condition scores for Battery, Body, Screen, and Overall are displayed.

Change the lead's Status using the status control, refresh the page, and verify the new status persists.

Use the status filter on the Buyback Leads list and verify only leads in the selected status are shown.

Use the search or phone filter on the Buyback Leads list to find a lead by phone number and verify it appears.

Open a non-existent lead by editing the URL id in the browser and verify the page shows "Lead not found" instead of crashing.

Submit the storefront buyback form with an empty phone number and verify client-side validation blocks the submission.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/buyback directly and verify buyback access is denied.

======== PRICE GUIDE ========

Open https://www.dreamgadgets.in/admin/price-guide and verify the "Buyback Price Guide" loads.

Use the "Search models..." field on the price guide to search for a model and verify matching models appear.

Open a model's price row in the price guide, enter a new price in the "₹ 0" price field, save, refresh the page, and verify the new price persists; then restore the original price and save again.

Use the condition or storage filters on the price guide and verify the list narrows accordingly.

Create a new price entry for a test model using the price guide's add control if offered, save, refresh, and verify it persists; then remove the test entry if the UI supports deletion.

Submit a price field with a negative value and verify validation rejects it.

Submit a price field with a non-numeric value and verify validation rejects it.

Open the storefront exchange flow and verify the estimated price shown to the customer matches the price guide value for that model.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/price-guide directly and verify access is denied.

======== RETURNS ========

Open https://www.dreamgadgets.in/admin/returns and verify the returns page loads with the heading "Returns" and "Manage product returns".

Use the search or filter controls on the Returns page and verify the list narrows to matching returns.

Open a return request from the list and verify it shows the original sale reference, product, quantity, reason, customer, and status.

Use the approval action on a pending return if offered, confirm, refresh, and verify the return status updates to approved.

Reject a return if that action is offered, confirm, refresh, and verify the status updates to rejected.

After a return is approved, open the related product in Inventory and verify the stock is restored.

After a return is approved, open the related sale and verify its status reflects the return.

Submit a return with no reason selected and verify validation blocks the submission.

Open the storefront return request page at https://www.dreamgadgets.in/returns, fill the "Contact Form" with a test request, submit, and verify the application reports the actual submission result.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/returns directly and verify return access is denied.

======== COUPONS ========

Open https://www.dreamgadgets.in/admin/coupons and verify the coupons list loads.

Use the search field on the Coupons page to search a coupon by code and verify it appears.

Click Create Coupon on the Coupons page and verify the coupon creation form opens.

Create a test coupon with code ZZWEBTEST10, a percentage discount of 10, a usage limit of 5, and a future expiry date, save, and verify it appears in the coupons list.

Open the newly created ZZWEBTEST10 coupon and verify its code, discount, usage limit, and expiry match what was entered.

Refresh the coupons list and verify the coupon persists.

Edit the test coupon's discount to 15, save, refresh, and verify the change persists; then edit it back to 10 and save.

Deactivate the ZZWEBTEST10 coupon using the status toggle, refresh, and verify it shows as inactive.

Reactivate the ZZWEBTEST10 coupon, refresh, and verify it shows as active.

Submit the coupon form with an empty code and verify validation blocks the submission.

Submit the coupon form with an expiry date in the past and verify validation rejects it.

Submit the coupon form with a discount greater than 100 percent and verify validation rejects it.

Create a duplicate coupon with a code that already exists and verify the application reports the duplicate.

Apply the ZZWEBTEST10 coupon in the storefront cart at https://www.dreamgadgets.in/cart after adding a product, verify the discount is applied to the total, then remove the coupon and verify the total returns to normal.

Delete the ZZWEBTEST10 coupon using the supported delete control if the UI offers it, then verify it no longer appears in the list.

Log in as shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/coupons directly and verify coupons are view-only for this role with create and edit controls hidden or disabled.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/coupons directly and verify coupon access is denied.

======== EMI PLANS ========

Open https://www.dreamgadgets.in/admin/emi and verify the EMI plans page loads, or shows "No EMI Providers" when none exist.

Create an EMI provider named "ZZ Webtest Finserv" using the provider creation control, save, and verify it appears in the list.

With the test provider selected, create an EMI plan with tenure "6 Months", enter a provider label such as "Bajaj Finserv" if the field appears, an interest rate, and a description of "Flexible EMI options...", save, and verify the plan appears.

Set a maximum amount field with the "Unlimited" placeholder to a value, save, refresh, and verify the value persists; then restore the original value.

Open the newly created EMI plan and verify its tenure, interest rate, and limits match what was entered.

Refresh the EMI page and verify the provider and plan persist.

Edit the test EMI plan's interest rate, save, refresh, and verify the change persists.

Submit the EMI plan form with an empty tenure and verify validation blocks the submission.

Submit the EMI plan form with a negative interest rate and verify validation rejects it.

Delete the test EMI plan and the "ZZ Webtest Finserv" provider using the supported delete controls if offered, then verify they no longer appear.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/emi directly and verify EMI access is denied.

======== REFUNDS ========

Open https://www.dreamgadgets.in/admin/refunds and verify the refunds page loads.

Use the field labelled "Search order #, customer, payment ID..." to search for a refund by order number and verify matching refunds appear.

Search for a refund by customer name using the same field and verify matching refunds appear.

Search for a refund by payment ID using the same field and verify matching refunds appear.

Open a pending refund from the list and verify it shows the order reference, amount, payment method, status, and requested date.

Click Confirm Refund on a pending test refund, confirm the action, refresh the page, and verify the refund status changes to refunded.

After confirming a refund, open the related sale and verify its payment section reflects the refund.

Attempt to confirm the same refund again and verify the application does not allow double-refunding.

Open an already-refunded refund and verify the Confirm Refund control is not offered.

Search with a nonsense value such as "ZZZNOFOUND" and verify the list shows no results without errors.

Log in as shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/refunds directly and verify refund access for this role matches its view-only payments permission, with confirm actions disabled or denied.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/refunds directly and verify refund access is denied.

======== REPORTS ========

Open https://www.dreamgadgets.in/admin/reports and verify "Reports & Analytics" loads with "Report Type", "From Date", and "To Date" controls.

On the Reports page, select Daily Sales in the Report Type dropdown, set From Date and To Date to the current week, and generate the report; verify the report renders rows of sales for that range.

With the Daily Sales report generated, change the date range to a single day and verify the report narrows to that day.

With a report generated, use the branch filter if offered and verify the report data is scoped to the selected branch.

Generate a sales report for the current month, verify the totals shown match the sum of the listed rows.

Generate an inventory or stock report, verify it lists products with their stock quantities.

Generate a client report if offered in the Report Type dropdown, verify it lists clients.

Use the Export Reports control and verify a report file downloads.

Use the "Download Excel" action for a report and verify an Excel file downloads and opens with the report data.

Open the "Quick Links" section on the Reports page and verify each quick link opens the corresponding report.

Use the "Amount Range" filter on a report if offered, set a minimum and maximum amount, and verify the rows narrow to that range.

Generate a report with a From Date later than the To Date and verify the application rejects the invalid range.

Generate a report with an empty date range and verify sensible default behavior instead of an error.

Generate a report after changing the branch selector and verify the numbers change to match the branch.

Refresh the reports page and verify the controls reset without errors.

Log in as shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/reports directly and verify report access is denied because this role has no reports permission.

Log in as manager@dreamgadgets.in, open https://www.dreamgadgets.in/admin/reports, generate a report, and verify viewing and exporting work for this role.

======== GST REPORTS ========

Open https://www.dreamgadgets.in/admin/gst and verify the GST Reports page loads.

Set the date range on the GST page to the current month and generate the GST summary; verify invoice-level GST rows are listed.

Verify the GST report shows per-invoice taxable value, CGST, SGST, and total tax amounts.

Verify the ITC section of the GST page loads, or shows "No ITC Data" when there is no input tax credit data instead of crashing.

Use the export control on the GST page and verify a GST report file downloads.

Verify the GST report only includes sales that are not voided.

Change the branch selector, regenerate the GST report, and verify the figures are scoped to the selected branch.

Generate the GST report with an empty date range and verify it uses a default range without errors.

Log in as shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/gst directly and verify GST access is denied for this role.

======== NOTIFICATIONS ========

Open https://www.dreamgadgets.in/admin/notifications and verify the notifications page loads, showing items or the empty state "All caught up".

Click the notification bell in the admin header and verify the notification dropdown opens with the same notifications.

Open a notification from the list and verify it navigates to the related record.

Use the mark-as-read control on a notification if offered, refresh the page, and verify the notification is no longer marked unread.

Use the mark-all-as-read control if offered, refresh, and verify all notifications show as read.

Generate a new event (for example complete a POS sale), refresh the notifications page, and verify a new notification appears for the event.

Refresh the notifications page and verify previously read notifications remain read.

Log in as shopsales@dreamgadgets.in, open https://www.dreamgadgets.in/admin/notifications directly and verify notification access is denied for this role.

======== USERS & ROLES ========

Open https://www.dreamgadgets.in/admin/users and verify the users page loads with "Manage admin users".

Use the search field on the Users page to search for "Owner" and verify the owner user appears.

Use the search field to search by phone 9800000003 and verify the shop sales user appears.

Open the owner user from the list and verify the detail shows name, email, phone, role, branch, and active status.

Open the store manager user and verify its role shows as store_manager.

Open the employee user and verify its role shows as employee.

Click Add User on the Users page and verify the user creation form opens with first name, last name, phone, and password fields including the "Min 6 characters" password hint.

Create a test user with first name ZZ, last name Webtest, phone 9876599999, a password of Test@1234, and role employee, save, and verify the user appears in the list.

Open the newly created ZZ Webtest user, verify the assigned role and branch, change the role to calling_staff, save, refresh, and verify the role change persists; then change the role back to employee and save.

Assign the test user to a different branch if the form offers branch assignment, save, refresh, and verify the assignment persists; then assign it back to the original branch.

Submit the user form with an empty first name and verify validation blocks the submission.

Submit the user form with a phone number shorter than 10 digits and verify phone validation rejects it.

Submit the user form with a password shorter than 6 characters and verify the "Min 6 characters" validation rejects it.

Attempt to create a user with the phone 9800000001 that already exists and verify the application reports the duplicate.

Deactivate the ZZ Webtest user, refresh, and verify it shows as inactive; then reactivate it and verify it shows active.

Attempt to log in at https://www.dreamgadgets.in/admin/login as zz.webtest's phone or email while the account is deactivated and verify login is denied; after reactivating, do not perform further logins as the test user.

Open https://www.dreamgadgets.in/admin/settings?tab=Roles and verify the roles list loads showing shop_owner, store_manager, shop_sales, store_sales, calling_staff, multi_store_manager, and employee.

Open https://www.dreamgadgets.in/admin/settings?tab=Permissions and verify the permission matrix loads and shows the shop_owner role holding all module permissions.

Open https://www.dreamgadgets.in/admin/settings?tab=Roles as owner@dreamgadgets.in and verify each role's assigned modules are displayed; do not change any assignment.

Open the settings roles tab as manager@dreamgadgets.in and verify role editing cannot be saved by this account.

Attempt to open a seeded account (owner, manager, shopsales, storesales, calling, employee) for editing and verify no changes are saved to it; leave all six seeded accounts untouched.

Delete the ZZ Webtest user using the supported delete control if the UI offers it, then verify it no longer appears in the list.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/users directly and verify user management is denied.

======== BRAND HEROES ========

Open https://www.dreamgadgets.in/admin/brands and verify the brands page loads listing the seeded brands Apple, Samsung, OnePlus, Xiaomi, Realme, Vivo, Oppo, and Google.

Use the search field on the brands page to search for Samsung and verify only Samsung appears.

Open the Apple brand from the list and verify its detail shows the brand name, sort order, and associated products.

Open the Samsung brand and verify its associated products are listed.

Use the product filter or product list on a brand detail to verify products belong to that brand.

Edit a brand's display name field, save, refresh, and verify the change persists; then restore the original name and save again.

Submit the brand form with an empty name and verify validation blocks the submission.

Create a test brand named "ZZ Webtest Brand" if the create control exists, save, refresh, and verify it appears; then delete it with the supported delete control so the seeded brand list is restored.

Open https://www.dreamgadgets.in/brands on the storefront and verify the customer-facing brand list shows the seeded brands.

Open https://www.dreamgadgets.in as owner@dreamgadgets.in, then as employee@dreamgadgets.in open https://www.dreamgadgets.in/admin/brands directly and verify brand management is denied for the employee.

======== ANNOUNCEMENT BAR ========

Open https://www.dreamgadgets.in/admin/announcement-bar and verify the announcement editor loads.

Record the current announcement state, then toggle "Enable Announcement Bar" on, enter the text "e.g., 🚀 Free shipping on orders over ₹999" style message such as "ZZ Webtest announcement", set a link such as "/products" in the "e.g., /products or https://..." field, and save.

After saving, refresh the announcement page and verify the announcement text, link, and enabled state persist.

After saving, open https://www.dreamgadgets.in on the storefront and verify the announcement bar appears at the top with the saved text.

Click the announcement's link on the storefront and verify it navigates to the target page.

Return to the announcement editor, restore the original text and enabled state exactly as recorded before the test, save, refresh, and verify the original state is back.

Clear the announcement text and save, and verify the application validates or disables the bar appropriately instead of saving an empty announcement.

Attempt to set the announcement link to an invalid value and verify the field accepts only valid paths or URLs as designed.

Log in as manager@dreamgadgets.in and verify Announcement Bar is not visible in the sidebar.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/announcement-bar directly, and verify announcement editing is denied.

======== WHATSAPP ========

Open https://www.dreamgadgets.in/admin/whatsapp and verify the WhatsApp Inbox loads, showing conversations or "No conversations".

Use the "Search conversations…" field to search a conversation by customer name or phone and verify matching conversations appear.

Open a conversation from the inbox and verify the message history loads with customer and outbound messages.

Type a message in the "Type a message…" field in an open conversation and send it, then verify the message appears in the conversation history and the application reports the actual send result.

Send a message with an empty body and verify the send control is blocked instead of sending a blank message.

Refresh the WhatsApp inbox and verify previously loaded conversations and messages still appear.

Verify the conversation list shows unread indicators for unread conversations and that opening a conversation clears its unread badge after refresh.

Open https://www.dreamgadgets.in/admin/whatsapp/templates and verify the templates page loads with the message templates list.

Open a template and verify its name, category, and body content are displayed.

Create a test template named "ZZ Webtest Template" if the create control exists, save, refresh, and verify it appears; then delete it if deletion is supported.

Open https://www.dreamgadgets.in/admin/whatsapp/campaigns and verify the campaigns page loads with the campaign list.

Open a campaign from the list and verify its recipients, template, status, and sent counts are displayed.

Create a test campaign only if it can be saved without sending messages to real customers; otherwise do not start any campaign and verify only that the campaign creation form opens and validates.

Submit the campaign form with no recipients selected and verify validation blocks the submission.

Complete a POS sale, open the sale detail, click WhatsApp Invoice, and verify the application reports the queueing result for the WhatsApp invoice with the toast "Invoice queued for WhatsApp delivery" or an actual error.

Log in as store_sales, open the WhatsApp Inbox, open a conversation, and verify sending is denied or the send control is disabled for this view-only role.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/whatsapp directly and verify WhatsApp access is denied.

======== BANNER MANAGEMENT ========

Open https://www.dreamgadgets.in/admin/banners and verify the banners page loads with the "All Banners" view.

Click the "Home Banners" view and verify only home-page banners are listed.

Click the "Shop Banners" view and verify only shop-page banners are listed.

Click the "Promotional" view and verify only promotional banners are listed.

Open an existing banner and verify it shows its title, subtitle, button label, link, image, and background colour values.

Record the banner's current values, then click "Edit Banner Image", change a text field such as the title placeholder "Big Sale Weekend" to a test title "ZZ Webtest Banner", change the subtitle placeholder "Up to 40% off on premium phones" accordingly, keep the button label "Shop Now", keep the link field "/products or https://", and save.

After saving, refresh the banners page and verify the banner shows the test values.

Open https://www.dreamgadgets.in on the storefront and verify the updated banner text appears in the home hero.

Click the banner's call-to-action on the storefront and verify it navigates to the configured link.

Return to the banner editor, restore the original title, subtitle, image, and background colour exactly as recorded, save, refresh, and verify the original banner is back.

Open the storefront home page and verify the restored banner appears with its original content.

Attempt to save a banner with an empty link and verify validation behaves as designed.

Attempt to save a banner with an invalid link value and verify the field rejects it.

Log in as manager@dreamgadgets.in, open https://www.dreamgadgets.in/admin/banners directly, and verify banner editing is denied because this role has no content permission.

======== SETTINGS ========

Open https://www.dreamgadgets.in/admin/settings as owner@dreamgadgets.in and verify the settings page loads.

Open the settings Branches tab using https://www.dreamgadgets.in/admin/settings?tab=Branches and verify the three seeded branches are listed with their details.

Open the settings Roles tab using https://www.dreamgadgets.in/admin/settings?tab=Roles and verify all seeded roles are listed.

Open the settings Permissions tab using https://www.dreamgadgets.in/admin/settings?tab=Permissions and verify the permission matrix loads.

Open the settings Content tab using https://www.dreamgadgets.in/admin/settings?tab=Content and verify the content settings load.

Click every other settings tab present on the settings page and verify each section loads without errors.

On the settings page, record the current value of the invoice prefix setting (invoice.prefix), change it to a test value such as "ZZT", save, refresh the page, and verify the test value persisted.

After verifying persistence, restore the invoice prefix to its original recorded value, save, refresh, and verify the original value is back.

On the settings page, record the default GST rate setting, change it to a different valid percentage, save, refresh, and verify it persisted; then restore the original GST rate, save, and verify the original value is back.

Submit a settings field with an empty value where the field is required and verify validation blocks the save.

Submit a settings numeric field with a negative or non-numeric value and verify validation rejects it.

After restoring all settings, open a sale detail PDF download and verify invoice numbering still works normally.

Log in as manager@dreamgadgets.in, open https://www.dreamgadgets.in/admin/settings, attempt to save any setting, and verify the save is denied because this role has no settings permission.

Log in as employee@dreamgadgets.in, open https://www.dreamgadgets.in/admin/settings directly, and verify settings changes are denied.

======== STOREFRONT — BROWSING ========

Open https://www.dreamgadgets.in and verify the home page shows the hero, the "Shop" section, "Trending", "Recommended", and deal sections.

On the home page, scroll through the product carousels and verify product cards show image, name, price, and discount.

On the home page, click a product card and verify it opens the product detail page for that product.

Open https://www.dreamgadgets.in/products and verify the product listing page loads with filters and sorting.

Use the search field on the products page to search for "Samsung" and verify matching products appear.

Use the search field to search for an nonsense term like "zzzqqq" and verify the page shows an empty state without errors.

Use the category filter on the products page to select Accessories and verify only accessories are listed.

Open https://www.dreamgadgets.in/products?category=accessories from the header "Accessories" link and verify only accessories are listed.

Open https://www.dreamgadgets.in/products?sort=discount from the header deals link and verify products are sorted by discount.

Use the brand filter on the products page to select Apple and verify only Apple products are listed.

Use the price sort or price filter on the products page and verify the ordering changes accordingly.

Open a product detail page from the listing and verify it shows the product name, price, images, condition, storage options, stock status, and the "6-Month Warranty" badge.

Verify the product detail shows "In Stock" for an available product and "Out of Stock" for an unavailable one.

On the product detail, verify the specifications section loads with product specs.

On the product detail, verify the trust elements section loads with warranty and quality information.

On the product detail, verify the related products section loads with other products.

On the product detail, verify the "Customer Reviews" section loads and shows the rating summary and review list, or shows zero reviews when none exist.

Click "Write a Review" on a product detail, enter a rating in the "Rating" field, a name in the "Your Name" field, a review in the "Review" field, submit, and verify the review appears after refresh; then delete the review if the UI allows the author to remove it.

Submit the review form with an empty body and verify validation blocks the submission.

Submit the review form twice quickly for the same product and verify the review throttle prevents a duplicate submission.

On the product detail, click the Wishlist control and verify the product is added; open https://www.dreamgadgets.in/wishlist and verify it appears under "My Wishlist".

On the wishlist page, remove the product and verify "Your wishlist is empty" appears after refresh.

On the product detail, click Add to Cart and verify the cart count in the header increments.

Open https://www.dreamgadgets.in/cart and verify the cart shows the product, quantity controls, "Order Summary", "Total Savings", and "Total".

In the cart, click "Increase quantity" and verify the line quantity and total update.

In the cart, click "Decrease quantity" and verify the line quantity and total update.

In the cart, remove the product and verify "Your Cart is Empty" appears.

Open https://www.dreamgadgets.in/stores and verify the "Our Stores" page lists the three Dream Gadgets branches with addresses and contact details.

Open a store from the stores page and verify its details, working hours, phone, and directions links are shown.

Open https://www.dreamgadgets.in/brands and verify the brand list loads and clicking a brand opens its products.

Open https://www.dreamgadgets.in/offers and verify the offers page loads with current offers.

Open https://www.dreamgadgets.in/deals and verify the deals page loads with discounted products.

Open https://www.dreamgadgets.in/blog and verify the blog page loads with its posts.

Open https://www.dreamgadgets.in/faq and verify the FAQ page loads with questions and answers; expand and collapse a question.

Open https://www.dreamgadgets.in/about and verify the about page loads.

Open https://www.dreamgadgets.in/contact and verify the "Contact Us" page loads with the "Send us a message" form.

Open https://www.dreamgadgets.in/warranty and verify the warranty page loads.

Open https://www.dreamgadgets.in/shipping and verify the shipping policy page loads.

Open https://www.dreamgadgets.in/cancellation and verify the cancellation and refunds policy page loads.

Open https://www.dreamgadgets.in/privacy and verify the privacy policy page loads.

Open https://www.dreamgadgets.in/terms and verify the terms page loads.

Open a non-existent page such as https://www.dreamgadgets.in/zzz-not-a-page and verify the custom 404 page is shown.

======== STOREFRONT — CONTACT & PARTNER FORMS ========

Open https://www.dreamgadgets.in/contact, fill First Name with ZZ, Last Name with Webtest, Phone Number with 9876500010, Email with zz.webtest@example.com, Message with "ZZ Webtest inquiry", submit the "Send us a message" form, and verify the application reports the actual submission result.

Submit the contact form with an empty message and verify validation blocks the submission.

Submit the contact form with an empty phone number and verify validation blocks the submission.

Submit the contact form with an invalid phone number and verify phone validation rejects it.

Submit the contact form with an invalid email and verify email validation rejects it.

Open https://www.dreamgadgets.in/partner, verify the partner page loads with the four partner types, then click the partner inquiry form.

Submit the partner inquiry form with all fields empty and verify the message "Please fill in all required fields." appears.

Submit the partner inquiry form with name ZZ Webtest, email zz.webtest@example.com, phone 9876500011, a partner type of Retail Partner, message "ZZ Webtest partner inquiry", and verify the success screen "Inquiry Submitted!" appears.

On the success screen, click "Submit Another", verify the form resets, then go back without submitting again.

On the success screen, click "Go Home" and verify you return to the home page.

======== STOREFRONT — SELL / BUYBACK FLOWS ========

Open https://www.dreamgadgets.in/sell and verify the "Sell Your Phone" page loads with its wizard steps.

In the sell wizard, select a brand in the brand selector, then select a model in the model selector, and verify the wizard advances.

In the sell wizard, choose the device condition in the condition selector and verify the estimated price card updates.

In the sell wizard, upload a device photo in the photo step if it can be done with a test image, and verify the photo appears; remove it before continuing if removal is offered.

In the sell wizard, fill customer details with name ZZ Webtest, phone 9876500012, and verify the fields validate.

In the sell wizard, schedule a pickup in the pickup scheduler and verify the chosen slot is shown.

Reach the "Review Your Details" step and verify it summarizes the device, condition, customer, and pickup information exactly as entered.

Submit the sell request and verify the application reports the actual result and the lead appears in the admin Buyback Leads list at https://www.dreamgadgets.in/admin/buyback.

Open https://www.dreamgadgets.in/buyback and verify the buyback page loads with its "Get Paid Instantly." section and evaluation form.

Submit the buyback evaluation form with an empty phone number and verify validation blocks the submission.

Submit the buyback evaluation form with a valid test phone number and device details and verify the application reports the actual quote or submission result.

======== STOREFRONT — CHECKOUT ========

Open https://www.dreamgadgets.in/products, open a product, click Add to Cart, then click Proceed to Checkout and verify the checkout page opens with "Review Your Order".

On the checkout Shipping Address form, fill Full Name with ZZ Webtest, Phone Number with 9876500013, Street Address with 12 Test Street, City with Mumbai, State with Maharashtra, and Pincode with 400001.

Submit the checkout address form with all fields empty and verify each required message appears: "Full name is required", "Phone number is required", "Street address is required", "City is required", "State is required", and "Pincode is required".

Submit the checkout address form with an empty pincode and verify "Pincode is required" appears.

Submit the checkout address form with an invalid phone number and verify phone validation rejects it.

Advance to the payment step and verify the available payment options include PhonePe, GPay, UPI, Card, and NetBanking.

On the checkout payment step, select PhonePe and place the order; verify the page shows "Redirecting to PhonePe" and then reports the actual payment outcome rather than a fabricated confirmation.

If the payment completes, open https://www.dreamgadgets.in/orders and verify the new order appears under "My Orders" with the correct products and total.

If the payment is not completed, open https://www.dreamgadgets.in/orders and verify no paid order was created for the failed attempt.

Open the newly created order from the storefront orders page and verify it shows product, quantity, total, status, and shipping address.

Refresh the orders page and verify the order persists with the same status.

Open https://www.dreamgadgets.in/admin/orders as owner@dreamgadgets.in, search the storefront order, open it, and verify the admin detail matches the storefront order.

In the cart, add a coupon if the cart supports coupons, apply it, verify the discount reduces the total, remove the coupon, and verify the total returns to normal.

With an empty cart, open https://www.dreamgadgets.in/checkout directly and verify the checkout does not start and redirects to the empty cart state.

======== STOREFRONT — ACCOUNT & TRACKING ========

Open https://www.dreamgadgets.in/account while signed in and verify "My Account" loads with "Recent Orders" and "Notification Preferences".

On the account page, verify the profile section shows the signed-in user's name and email.

On the account page, verify "Recent Orders" lists the orders placed during this test session.

On the account page, open Notification Preferences and toggle a preference, save, refresh, and verify the preference persisted.

Open https://www.dreamgadgets.in/orders while signed in and verify "My Orders" lists the account's orders.

Open an order from the storefront orders page and verify its details, status timeline, and total are shown.

Open https://www.dreamgadgets.in/track-order and verify the "Track Your Order" page loads.

In the track-order form, enter an order number from the test order and submit; verify the result shows Order, Ordered On, Total, Shipping Address, Courier, and Tracking No. fields for that order.

Track a non-existent order number such as ZZNOORDER and verify the page reports the order was not found without crashing.

Sign out, open https://www.dreamgadgets.in/orders, and verify the "Sign in Required" message is shown.

======== VALIDATION — KEY FORMS ========

Open the admin POS, leave the search empty, and verify clicking into it shows an empty result state rather than an error.

On the admin client creation form, submit with only a name and no phone and verify the phone-required error appears.

On the admin coupon creation form, submit with only a code and no discount and verify the discount-required error appears.

On the admin purchase entry, submit with a vendor name but no product and verify the product-required error appears.

On the admin transfer form, submit with a product but no destination branch and verify the destination-required error appears.

On the admin Add User form, submit with a phone but no password and verify the password-required error appears.

On the admin announcement form, save with only a link and no text and verify the text-required validation appears.

On the storefront contact form, submit with a name and message but an invalid phone of "123" and verify the phone validation error appears.

On the storefront partner form, submit with a name but no email and verify the message "Please fill in all required fields." appears.

On the storefront checkout address form, enter a pincode with fewer than 6 digits and verify the pincode validation error appears.

On the storefront register form, enter a password shorter than 8 characters and verify the "At least 8 characters" validation appears.

On the storefront review form, submit with a rating but no text and verify validation blocks it.

======== REFRESH / PERSISTENCE ========

After creating a client, refresh the client detail page and verify the saved client data is unchanged.

After editing a client's phone number, refresh the client detail page and verify the new number persisted.

After creating a purchase, refresh the purchases list and the purchase detail and verify the purchase persisted with all fields.

After creating a transfer, refresh the transfers list and verify the transfer persisted.

After creating a coupon, refresh the coupons list and verify the coupon persisted with its values.

After editing a coupon, refresh and verify the edited values persisted.

After creating a test user, refresh the users list and verify the user persisted.

After changing an online order's status, refresh the order detail and verify the new status persisted.

After confirming a refund, refresh the refunds list and verify the refunded status persisted.

After changing a buyback lead's status, refresh and verify the status persisted.

After enabling and saving an announcement, refresh the announcement page and verify the enabled state persisted.

After editing and saving a banner, refresh the banners page and verify the values persisted.

After changing and saving a settings value, refresh the settings page and verify the value persisted, then restore it.

After completing a POS sale, refresh the sales list and the sale detail and verify the sale persisted exactly once.

After a page refresh on the admin dashboard, verify the session persists and the statistics reload.

======== DATA SAFETY AND CLEANUP ========

Do not delete any historical sale; only void the POS test sale created during this session.

Void the POS test sale created in this session using the Void Sale control and confirm it is the only sale affected.

Delete the "ZZ Webtest Client" from the Clients page if a delete control exists, then verify it no longer appears in the list.

Delete the ZZWEBTEST10 coupon from the Coupons page if a delete control exists, then verify it no longer appears in the list.

Delete the ZZ Webtest user from the Users page if a delete control exists, then verify it no longer appears in the list.

Delete the "ZZ Webtest Accessory" from the Accessories page if a delete control exists, then verify it no longer appears in the list.

Delete any "ZZ Webtest" brand, template, banner, or announcement created during this session if a delete control exists.

Restore the announcement bar to its exact pre-test state, save, refresh, and verify the original state is back.

Restore the edited banner to its exact pre-test values, save, refresh, and verify the original banner is back.

Restore all settings values changed during this session to their recorded originals, save, refresh, and verify the originals are back.

Restore the price guide entry changed during this session to its recorded original price, save, and verify it is back.

Clear the storefront cart completely and verify "Your Cart is Empty" appears.

Remove any test product left in the wishlist and verify "Your wishlist is empty" appears.

Open the six seeded accounts in the Users page, verify each still has its original role and active status, and make no changes to them.

Verify no seeded branch was deleted by opening the Stores page and confirming all three branches are still listed.
